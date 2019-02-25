import * as React from 'react';
import ReactDOM from 'react-dom';
import { Settings } from '../constants'
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

function saveTransforms(transforms) {
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

function gatherUsage(date, callback) {
  const remoteUnsubscribe = remote.getGlobal('gatherUsage')(date, callback)

  let done = false
  function unsubscribe() {
    console.log('unsubscribe', done)
    if (done) return
    done = true
    window.removeEventListener('beforeunload', unsubscribe)
    remoteUnsubscribe()
  }

  window.addEventListener('beforeunload', unsubscribe)

  return unsubscribe
}

function render() {

  ReactDOM.render((
    <App
      gatherUsage={gatherUsage}
      watchDate={watchDate}
      saveTransforms={saveTransforms}
      settings={settings} />
  ), document.getElementById('app'));
}

render()

ipcRenderer.on('settings', (_event: any, newSettings: Settings) => {
  settings = newSettings
  watchDate(reportDate)
  render()
})


ipcRenderer.send('watch-date', reportDate)
