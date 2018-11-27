// https://medium.freecodecamp.org/building-an-electron-application-with-create-react-app-97945861647c

// Modules to control application life and create native browser window
const {app, Menu, Tray, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const gatherUsage = require('./gather-usage')
const logWindows = require('./log-windows')
const { LOGFILE } = require('../constants')
const { readSettings, notifyOpenWindows } = require('./settings')

if (process.env.ELECTRON_START_URL) {
  const chokidar = require('chokidar')
  chokidar.watch(__dirname).on('change', () => {
    console.log('change')
    app.exit(1)
  })
}



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({show: false})
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  let startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  if (process.env.ELECTRON_START_URL) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('did-finis-hload')
    const win = mainWindow

    readSettings()
    notifyOpenWindows()
    const unsubscribe = gatherUsage(LOGFILE, (data) => {
      if (mainWindow !== win) {
        return unsubscribe()
      }

      mainWindow.webContents.send('update', data)
      readSettings()
    })
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function showWindow() {
  console.log('showWindow', mainWindow)
  if (mainWindow == null) {
    createWindow()
  } else {
    mainWindow.focus()
  }
}

let appIcon
function onReady() {
  logWindows()
  const icon = path.join(__dirname, '../../Free_Egg_Timer_Vector_01/clock.png')

  appIcon = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Open', type: 'normal', click: showWindow},
    // {label: 'recording', type: 'checkbox', checked: true},
    {label: 'Exit', type: 'normal', click: () => {
      process.exit()
    }}
  ])
  appIcon.setToolTip('This is my application.')
  appIcon.setContextMenu(contextMenu)


  if (process.env.ELECTRON_START_URL) {
    showWindow()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady)

app.on('window-all-closed', function () {
  // This app doesn't exit when the window closes.
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
