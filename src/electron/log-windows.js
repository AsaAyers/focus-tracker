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
      // On windows these seem to come back as empty strings while the screen is locked
      const isEmpty = win.className === "" && win.title === ""

      if (win.className === 'LockApp.exe' || isEmpty) {
        if (event.className !== 'LOCK') {
          event = {
            ts,
            className: "LOCK",
            title: ""
          }
          logWindow(event)
        }
        return
      } else if (event.className === "LOCK") {
        logWindow({
          ts,
          className: "UNLOCK",
          title: ""
        })
      }
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
