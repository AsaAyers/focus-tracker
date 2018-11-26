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
  let locked = false
  setInterval(() => {
    const ts = Math.floor(Date.now() / 1000)
    if (isWin) {
      // eslint-disable-next-line global-require
      const lockYourWindows = require('lock-your-windows')
      const isLocked = lockYourWindows.isLocked()

      if (locked !== isLocked) {
        locked = isLocked
        if (isLocked) {
          logWindow({ ts, className: 'LOCK', title: '' })
          return
        }
        logWindow({ ts, className: 'UNLOCK', title: '' })
      } if (locked) {
        // Don't record any events if the console is locked
        return
      }
    }

    let win
    try {
      win = activeWin.sync()
    } catch (e) {
      console.error(e)
      return
    }
    if (event.title === win.title && event.className === win.owner.name) {
      return
    }
    event = {
      ts,
      className: win.owner.name,
      title: win.title,
    }
    logWindow(event)
  }, 1000)
}
