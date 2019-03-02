import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Settings, Transform, UsageCallback } from '../constants'
import App from './app';

declare global {
  interface Window { require: any; }
}

console.log('renderer? Maybe?')

const electron: any = window.require('electron');
const { ipcRenderer, remote } = electron

// if (process.env.NODE_ENV === 'development') {
//   global.ipcRenderer = ipcRenderer
// }

function saveTransforms(transforms: Array<Transform>) {
  ipcRenderer.send('save-transforms', transforms)
}

let settings: Settings
let reportDate = new Date()
// reportDate.setDate(reportDate.getDate() - 1)
console.log(reportDate)

function watchDate(date: Date) {
  reportDate = date
  ipcRenderer.send('reset', reportDate)
}


function render() {

  ReactDOM.render((
    <App
      watchDate={ watchDate }
      saveTransforms={ saveTransforms }
      settings={ settings } />
  ), document.getElementById('app'));
}

render()

ipcRenderer.on('settings', (_event: any, newSettings: Settings) => {
  settings = newSettings
  watchDate(reportDate)
  render()
})


ipcRenderer.send('watch-date', reportDate)
