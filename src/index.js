import React from 'react';
import ReactDOM from 'react-dom';
import App from './react/App';
import * as serviceWorker from './react/serviceWorker';
const electron = window.require('electron');
const { ipcRenderer, remote } = electron

if (process.env.NODE_ENV === 'development') {
  global.ipcRenderer = ipcRenderer
}

function saveTransforms(transforms) {
  ipcRenderer.send('save-transforms', transforms)
}

let settings = {}
let reportDate = new Date()
// reportDate.setDate(reportDate.getDate() - 1)
console.log(reportDate)

function watchDate(date) {
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
  ), document.getElementById('root'));
}

ipcRenderer.on('settings', (event, newSettings) => {
  settings = newSettings
  watchDate(reportDate)
  render()
})


ipcRenderer.send('watch-date', reportDate)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
