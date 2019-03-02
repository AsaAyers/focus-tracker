import * as os from 'os'
import * as path from 'path'

export const SETTINGS = path.join(os.homedir(), '.focus-tracker-ts.json')
export const LOGFILE = path.join(os.homedir(), 'focus-tracker-ts.log')
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
export interface Record {
  app: FocussedWindow["app"],
  total: number,
  titles: Array<{
    name: string,
    total: number
  }>
}

export type UsageCallback = (records: Array<Record>) => void
