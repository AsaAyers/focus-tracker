import os from 'os'
import path from 'path'

export const SETTINGS = path.join(os.homedir(), '.focus-tracker.json')
export const LOGFILE = path.join(os.homedir(), 'focus-tracker.log')
export const TRANSFORMS = path.join(os.homedir(), '.i3-monitor.json')

export type FocussedWindow = {
  ts: number,
  app: string,
  title: string,

}

export type NewTransform = {
  title: string,
  app: Array<string>,
  replaceTitle: string,
  replaceApp: string,
  log?: boolean,

}
export type Transform = NewTransform & {
  id: string,
}


export type Settings = {
  logfile: string,
  transforms: Array<Transform>,
  mtime: number,
}
