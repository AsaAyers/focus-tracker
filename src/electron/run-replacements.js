const { readSettings } = require('./settings')


module.exports = function runReplacements(record) {
  const { transforms } = readSettings()
  // eslint-disable-next-line no-shadow
  return transforms.reduce((record, transform) => {
    const titleRegex = new RegExp(transform.title)

    if (record.title == null) {
      // eslint-disable-next-line no-param-reassign
      record.title = ''
    }

    const matchClass = (
      transform.app == null
        || transform.app.length === 0
        || transform.app.indexOf(record.app) >= 0
    )
    const match = record.title.match(titleRegex)

    if (transform.log) {
      console.log(match, matchClass, record)
    }

    if (matchClass && match) {
      const title = record.title.replace(titleRegex, transform.replaceTitle)

      let { app } = record
      if (transform.replaceApp) {
        app = transform.replaceApp.replace(
          /\$(\d)/,
          (full, digit) => match[digit],
        )
      }

      return {
        ...record,
        app,
        title,
      }
    }
    return record
  }, record)
}
