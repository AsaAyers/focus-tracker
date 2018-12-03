const fs = require('fs')
const activeWin = require('active-win')
const { LOGFILE } = require('../constants')
const runReplacements = require('./run-replacements')
const createDebug = require('debug')

const debug = createDebug('focus-tracker:log-windows')

function logWindow(data) {
  const record = runReplacements(data)
  const line = JSON.stringify(record)
  debug(line)
  fs.appendFile(LOGFILE, `${line}\n`, (err) => {
    if (err) throw err
  })
}

module.exports = function logWindows() {
  let event = {}
  let counter = 0
  setInterval(() => {
    console.log('counter', counter++)
    const ts = Math.floor(Date.now() / 1000)

    let win
    try {
      win = activeWin.sync()
    } catch (e) {
      console.error(e)
      return
    }

    if (event.title === win.title && event.app === win.owner.name) {
      return
    }
    event = {
      ts,
      app: win.owner.name,
      title: win.title,
    }
    counter = 0
    logWindow(event)
  }, 10000)
}
