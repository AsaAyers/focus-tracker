import React from 'react';
import ReactDOM from 'react-dom';
import App from './react/App';
import * as serviceWorker from './react/serviceWorker';
const electron = window.require('electron');
const { ipcRenderer } = electron

if (process.env.NODE_ENV === 'development') {
  global.ipcRenderer = ipcRenderer
}

function saveTransforms(transforms) {
  ipcRenderer.send('save-transforms', transforms)
}

let data = []
let settings = {}

function render() {
  ReactDOM.render((
    <App
      saveTransforms={saveTransforms}
      data={data}
      settings={settings} />
  ), document.getElementById('root'));
}

ipcRenderer.on('update', (event, newData) => {
  data = newData
  render()
})

ipcRenderer.on('settings', (event, newSettings) => {
  console.log('new settings?')
  settings = newSettings
  render()
})



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
