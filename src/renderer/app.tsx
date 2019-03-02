import * as React from 'react';
import AppUI, { SelectedTab } from './app-ui'
import { Transform, UsageCallback } from '../constants'

interface Props {
  watchDate: any
  saveTransforms: any
  settings: any
}

const electron: any = window.require('electron');
const { ipcRenderer, remote } = electron

function gatherUsage(date: Date, callback: UsageCallback) {
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

const App: React.FC<Props> = function() {
  // Mabye a reducer with a dispatch would be better?
  const [ tab, setTab ] = React.useState(SelectedTab.Report)
  const [ editTransform, setEditTransform ] = React.useState(
    null as Partial<Transform> | null
  )
  const [ reportDate, setReportDate ] = React.useState(
    new Date()
  )

  return (
    <AppUI
      tab={tab}
      setTab={setTab}
      editTransform={editTransform}
      setEditTransform={setEditTransform}
      />
  )
}

export default App
