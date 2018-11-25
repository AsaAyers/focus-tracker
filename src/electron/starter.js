// Modules to control application life and create native browser window
const {app, Menu, Tray, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
require('electron-reload')(__dirname, {
  electron: require.resolve('.bin/electron')
});

console.log('wat')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, show: false})
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })


  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  console.log('startUrl', startUrl)
  mainWindow.loadURL(startUrl);

  if (process.env.ELECTRON_START_URL) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
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
  const icon = path.join(__dirname, '../../Free_Egg_Timer_Vector_01/clock.png')

  appIcon = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Open', type: 'normal', click: showWindow},
    {label: 'recording', type: 'checkbox', checked: true},
    {label: 'Exit', type: 'normal'}
  ])
  appIcon.setToolTip('This is my application.')
  appIcon.setContextMenu(contextMenu)

  showWindow()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
