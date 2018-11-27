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
      transform.className == null
        || transform.className.indexOf(record.className) >= 0
    )
    const match = record.title.match(titleRegex)

    if (transform.log) {
      console.log(match, matchClass, record)
    }

    if (matchClass && match) {
      const title = record.title.replace(titleRegex, transform.replaceTitle)

      let { className } = record
      if (transform.replaceClass) {
        className = transform.replaceClass.replace(
          /\$(\d)/,
          (full, digit) => match[digit],
        )
      }

      return {
        ...record,
        className,
        title,
      }
    }
    return record
  }, record)
}
