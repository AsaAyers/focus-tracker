const os = require('os')
const path = require('path')

const LOGFILE = path.join(os.homedir(), 'focus-tracker.log')

module.exports = {
  LOGFILE
}
