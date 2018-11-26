const Tail = require('tail-file')
const createDebug = require('debug')
const runReplacements = require('./run-replacements')

const debug = createDebug('focus-tracker')
const debugLine = debug.extend('line')
const debugTime = debug.extend('time')

function parseLine(line) {
  try {
    return JSON.parse(line)
  } catch (e) {
    return { ts: 0 }
  }
}

function reducer(data, line) {
  const { last, locked } = data
  const tmp = parseLine(line)

  if (tmp.ts > 0 && tmp.ts >= last.ts) {
    const record = runReplacements(tmp)
    // const { ts, title, className } = runReplacements(tmp);
    const time = record.ts - last.ts

    if (!record.className) {
      console.error(line)
      debug('missing className')
    }

    if (record.className === 'UNLOCK') {
      if (!locked) {
        return {
          ...data,
          last: record
        }
      }
    }
    if (locked) {
      if (record.className !== 'UNLOCK') {
        return data
      }
    }
    if (time < data.MIN_TIME) {
      return data
    }

    debugLine(time, line)
    if (!last.className) {
      debug('Missing className', last)
    }

    let records = data.records
    if (records[last.className] == null) {
      records = {
        ...records,
        [last.className]: { name: last.className, total: 0, titles: {} }
      }
    }
    let titles = records[last.className].titles
    titles = {
      ...titles,
      [last.title]: (titles[last.title] || 0) + time
    }

    records = {
      ...records,
      [last.className]: {
        ...records[last.className],
        total: records[last.className].total + time,
        titles,
      }
    }

    debugTime(last.className, last.title, '+', time)

    if (record.className === 'LOCK') {
      return {
        ...data,
        records,
        locked: true,
        last : {
          ...record,
          beforeLock: last.className,
        }
      }

    } else if (record.className === 'UNLOCK') {
      return {
        ...data,
        records,
        locked: false,
        last: {
          ...record,
          // When I unlock my computer in the morning, there isn't a matching
          // LOCK record, so beforeUnlock is undefined.
          className: last.beforeLock || last.className,
        }
      }
    }
    return {
      ...data,
      records,
      last : record
    }
  }

  return data
}

module.exports = function gatherUsage(filename, callback) {
  console.log('tail', filename)
  const tail = new Tail(filename, {
    startPos: 0
  })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let last = {
    ts: Math.round(today.getTime() / 1000),
    className: 'MIDNIGHT',
    title: 'none',
  }
  let data = {
    MIN_TIME: 10,
    today,
    last,
    locked: false,
    records: {}
  }

  tail.on('error', err => { throw err })

  tail.on('line', line => {
    console.log(line)
    data = reducer(data, line)
  })

  function sendReport() {
    const line = JSON.stringify({
      ts: Math.round(Date.now() / 1000),
      className: 'END',
      title: ""
    })

    const tmp = reducer(data, line)

    const sortedData = Object.values(tmp.records)
      .sort((a, b) => b.total - a.total)
      .map(record => {
        const sortedTitles = Object.keys(record.titles)
        .map(name => ({name, total: record.titles[name]}))
        .sort((a, b) => b.total - a.total)

        return {
          ...record,
          titles: sortedTitles
        }
      })

    callback(sortedData)
  }

  tail.on('eof', () => {
    sendReport()
  })

  tail.start()
  // At least report once a minute
  const reportInterval = setInterval(sendReport, 60000)
  return function unsubscribe() {
    clearInterval(reportInterval)
    tail.stop()
  }
}
