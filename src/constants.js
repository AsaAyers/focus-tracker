const os = require('os')
const path = require('path')

const LOGFILE = path.join(os.homedir(), 'focus-tracker.log')
const TRANSFORMS = path.join(os.homedir(), '.i3-monitor.json')

module.exports = {
  LOGFILE,
  TRANSFORMS,
}
