const fs = require('fs')
const { TRANSFORMS } = require('../constants')

module.exports = function runReplacements(record) {
  let transforms = []
  if (fs.existsSync(TRANSFORMS)) {
    transforms = JSON.parse(fs.readFileSync(TRANSFORMS))
  }
  // eslint-disable-next-line no-shadow
  return transforms.reduce((record, transform) => {
    if (typeof transform.title === 'string') {
      // eslint-disable-next-line no-param-reassign
      transform.title = new RegExp(transform.title)
    }
    if (typeof transform.className === 'string') {
      // eslint-disable-next-line no-param-reassign
      transform.className = [transform.className]
    }

    if (record.title == null) {
      // eslint-disable-next-line no-param-reassign
      record.title = ''
    }

    const matchClass = (
      transform.className == null
        || transform.className.indexOf(record.className) >= 0
    )
    const match = record.title.match(transform.title)

    if (transform.log) {
      console.log(match, matchClass, record)
    }

    if (matchClass && match) {
      const title = record.title.replace(transform.title, transform.replaceTitle)

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
