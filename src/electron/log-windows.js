const fs = require('fs')
const activeWin = require('active-win')
const { LOGFILE } = require('../constants')
const runReplacements = require('./run-replacements')

function logWindow(data) {
  const record = runReplacements(data)
  const line = JSON.stringify(record)
  console.log(line)
  fs.appendFile(LOGFILE, `${line}\n`, (err) => {
    if (err) throw err
  })
}

module.exports = function logWindows() {
  const isWin = process.platform === 'win32'
  let event = {}
  setInterval(() => {
    const ts = Math.floor(Date.now() / 1000)

    let win
    try {
      win = activeWin.sync()
    } catch (e) {
      console.error(e)
      return
    }

    if (isWin) {
      if (win.owner.name === 'LockApp.exe' || win.owner.name === "" ) {
        if (event.app !== 'LOCK') {
          event = {
            ts,
            app: "LOCK",
            title: ""
          }
          logWindow(event)
        }
        return
      } else if (event.app === "LOCK") {
        logWindow({
          ts,
          app: "UNLOCK",
          title: ""
        })
      }
    }

    if (event.title === win.title && event.app === win.owner.name) {
      return
    }
    event = {
      ts,
      app: win.owner.name,
      title: win.title,
    }
    logWindow(event)
  }, 10000)
}
