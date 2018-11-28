function runTransform(record, transform) {
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


    if (matchClass && match) {
      const title = record.title.replace(titleRegex, transform.replaceTitle)

      let { app } = record
      if (transform.replaceApp) {
        app = transform.replaceApp.replace(
          /\$(\d)/,
          (full, digit) => match[digit],
        )
      }
      if (transform.log) {
        console.log(match, app, title)
      }

      // If I use the spread operator Babel compiles this file and then yells
      // about not having a default export
      return Object.assign({},
        record,
        {
          app,
          title,
        }
      )
    }
    return record
}

module.exports = runTransform
