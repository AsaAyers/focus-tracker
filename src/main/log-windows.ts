import os from 'os'
import { spawnSync } from 'child_process'
import fs from 'fs'
import activeWin from 'active-win'
import { LOGFILE, FocussedWindow } from '../constants'
import runReplacements from './run-replacements'


function logWindow(data: FocussedWindow) {
  const record = runReplacements(data)
  const line = JSON.stringify(record)
  console.log("WRITE LINE", line)
  fs.appendFile(LOGFILE, `${line}\n`, (err) => {
    if (err) throw err
  })
}

const { uid } = os.userInfo()
function isLocked(win: activeWin.Result | null) {
  if (process.platform === 'linux') {
    const { status } = spawnSync('pkill', ['-0', '--euid', String(uid), '--exact', 'i3lock'])
    return status === 0
  }

  if (process.platform === 'win32' && win != null) {
    return win.owner.name === '' || win.owner.name === 'LockApp.exe'
  }
  return false
}

export default function logWindows() {
  let event: FocussedWindow
  let win: activeWin.Result | null = null
  try {
    win = activeWin.sync()
  } catch (e) {
  }
  let locked = isLocked(win)
  if (locked != null) {
    // I'm intentionally starting this in the wrong state so that the first call
    // will always record a LOCK or UNLOCK event.
    locked = !locked
  }

  process.on('exit', () => {
    const ts = Math.floor(Date.now() / 1000)
    logWindow({ ts, app: 'LOCK', title: "" })
  });

  function captureCurrentWindow() {
    const ts = Math.floor(Date.now() / 1000)

    try {
      win = activeWin.sync()
    } catch (e) {
      console.error(e)
      return
    }

    if (locked !== isLocked(win)) {
      locked = !locked
      event = {
        ts,
        app: locked ? 'LOCK' : 'UNLOCK',
        title: '',
      }
      logWindow(event)
    }
    if (locked) {
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
    logWindow(event)
  }

  captureCurrentWindow()
  setInterval(captureCurrentWindow, 10000)
}
