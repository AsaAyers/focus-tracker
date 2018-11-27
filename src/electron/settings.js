const {app, ipcMain} = require('electron')
const os = require('os')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v4')

const SETTINGS = path.join(os.homedir(), '.focus-tracker.json')
const LOGFILE = path.join(os.homedir(), 'focus-tracker.log')

let settings = {
  logfile: LOGFILE,
  transforms: []
}

function normalizeTransform(transform) {
  let tmp = transform.app || transform.className
  let app = (typeof tmp === "string"
      ? tmp.split(',').map(s => s.trim())
      : (tmp || [])
    ).filter(s => s.length > 0)

  return {
    id: transform.id || uuid(),
    title: transform.title,
    app,
    replaceTitle: transform.replaceTitle,
    replaceApp: transform.replaceApp || transform.replaceClass,
  }
}

const browserWindows = []
app.on('browser-window-created', (e, win) => {
  browserWindows.push(win)

  win.on('closed', function () {
    let index = browserWindows.indexOf(win)
    browserWindows.splice(index, 1)
  })
})
function notifyOpenWindows() {
  browserWindows.forEach(
    win => win.webContents.send('settings', settings)
  )
}

// TODO: Rename this file to settings.js
function readSettings() {
  try {
    const stats = fs.statSync(SETTINGS)
    if (stats.mtime - settings.mtime !== 0) {
      console.log('mtime',stats.mtime - settings.mtime)
      settings = JSON.parse(fs.readFileSync(SETTINGS))
      settings.mtime = stats.mtime

      if (!Array.isArray(settings.transforms)) {
        settings.transforms = []
      }

      if (typeof settings.logfile !== 'string') {
        settings.logfile = LOGFILE
      }
      settings.transforms = settings.transforms.map(normalizeTransform)
      notifyOpenWindows()
    }
  } catch (e) {
    console.log(e)
  }
  return settings
}

function writeSettings(merge) {
  settings = {...settings, ...merge}
  fs.writeFileSync(SETTINGS, JSON.stringify(settings, null, 2))
  notifyOpenWindows()
}

ipcMain.on('add-transform', (event, transform) => {
  const transforms = [
    ...settings.transforms,
    normalizeTransform(transform)
  ]
  writeSettings({ transforms })
})

ipcMain.on('save-transforms', (event, transforms) => {
  writeSettings({
    transforms: transforms.map(normalizeTransform)
  })
})

module.exports = {
  readSettings,
  notifyOpenWindows,
}
