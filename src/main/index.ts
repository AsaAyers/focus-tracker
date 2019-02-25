'use strict'

import { app, BrowserWindow, Tray, Menu } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import logWindows from './log-windows'
import isDev from 'electron-is-dev'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null

function createMainWindow() {
  const window = new BrowserWindow()

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

let appIcon
function onReady() {
  logWindows()
  const icon = path.join(__dirname, '../../Free_Egg_Timer_Vector_01/clock.png')

  appIcon = new Tray(icon)
  function onClick() {
    console.log('click')
    createMainWindow()
  }
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', type: 'normal', click: onClick },
  ])
  appIcon.setToolTip('Focus Tracker')
  appIcon.setContextMenu(contextMenu)

  if (!app.requestSingleInstanceLock()) {
    createMainWindow()
  }

  if (isDev) {
    // adsf
    createMainWindow()
  }
}

// Instead of exiting the new instance of the app, I'm having the old one shut
// down. This makes development easier as I can just `npm start` and it will run
// the new code.
app.on('second-instance', () => {
  app.quit()
})

app.on('window-all-closed', () => {
  // This app doesn't exit when the window closes.
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  // mainWindow = createMainWindow()
  onReady()
})
