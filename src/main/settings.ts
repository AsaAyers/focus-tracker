import { app, ipcMain } from 'electron'
import * as fs from 'fs'
import { LOGFILE, Settings, SETTINGS, Transform } from '../constants'


let settings: Settings = {
  logfile: LOGFILE,
  transforms: [],
  mtime: 0,
}

// function normalizeTransform(transform: NewTransform): Transform {
//   return {
//     id: uuid(),
//     title: transform.title,
//     app: transform.app,
//     replaceTitle: transform.replaceTitle,
//     replaceApp: transform.replaceApp,
//   }
// }

const browserWindows: Array<Electron.BrowserWindow> = []
app.on('browser-window-created', (_e, win) => {
  browserWindows.push(win)

  win.on('closed', function() {
    let index = browserWindows.indexOf(win)
    browserWindows.splice(index, 1)
  })
})

export function notifyOpenWindows() {
  browserWindows.forEach(
    win => win.webContents.send('settings', settings)
  )
}

// TODO: Rename this file to settings.js
export function readSettings() {
  try {
    const stats = fs.statSync(SETTINGS)
    if (Number(stats.mtime) - settings.mtime !== 0) {
      settings = JSON.parse(String(fs.readFileSync(SETTINGS)))
      settings.mtime = Number(stats.mtime)

      if (!Array.isArray(settings.transforms)) {
        settings.transforms = []
      }

      if (typeof settings.logfile !== 'string') {
        settings.logfile = LOGFILE
      }
      notifyOpenWindows()
    }
  } catch (e) {
    console.log(e)
  }
  return settings
}

function writeSettings(merge: Partial<Settings>) {
  settings = { ...settings, ...merge }
  fs.writeFileSync(SETTINGS, JSON.stringify(settings, null, 2))
  notifyOpenWindows()
}

ipcMain.on('save-transforms', (_event: null, transforms: Array<Transform>) => {
  writeSettings({ transforms })
})
