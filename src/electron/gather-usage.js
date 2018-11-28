const Tail = require('tail-file')
const createDebug = require('debug')
const runReplacements = require('./run-replacements')

const debug = createDebug('focus-tracker')
const debugLine = debug.extend('line')
const debugTime = debug.extend('time')

function parseLine(line) {
  try {
    const record = JSON.parse(line)

    // Temporary backward compatibility
    if (!record.app && record.className) {
      record.app = record.className
    }
    return record
  } catch (e) {
    return { ts: 0 }
  }
}

function reducer(data, line) {
  const { last, locked } = data
  const tmp = parseLine(line)

  if (tmp.ts > 0 && tmp.ts >= last.ts) {
    const record = runReplacements(tmp)
    // const { ts, title, app } = runReplacements(tmp);
    const time = record.ts - last.ts

    if (!record.app) {
      console.error(line)
      debug('missing app')
    }

    if (record.app === 'UNLOCK') {
      if (!locked) {
        return {
          ...data,
          last: record
        }
      }
    }
    if (locked) {
      if (record.app !== 'UNLOCK') {
        return data
      }
    }
    if (time < data.MIN_TIME) {
      return data
    }

    debugLine(time, line)
    if (!last.app) {
      debug('Missing app', last)
    }

    // Cloning this first makes this easier, so I can just mutate the data below
    let records = [...data.records]

    let appIndex = records.findIndex(r => r.app === last.app)
    if (appIndex === -1) {
      records.push(
        { app: last.app, total: 0, titles: [] }
      )
      console.log('records', records)
      appIndex = records.findIndex(r => r.app === last.app)
    }
    const appRecord = records[appIndex]

    let titles = [...appRecord.titles]
    let titleIndex = titles.findIndex(t => t.name === last.title)
    if (titleIndex === -1) {
      titles.push(
        { name: last.title, total: 0 }
      )
      titleIndex = titles.findIndex(t => t.name === last.title)
    }
    const titleRecord = titles[titleIndex]
    if (!titleRecord) {
      console.log(
        last.title, titleIndex, titles
      )
    }

    titles[titleIndex] = {
      ...titleRecord,
      total: titleRecord.total + time
    }

    records[appIndex] = {
      ...appRecord,
      total: appRecord.total + time,
      titles,
    }

    debugTime(last.app, last.title, '+', time)

    if (record.app === 'LOCK') {
      return {
        ...data,
        records,
        locked: true,
        last : {
          ...record,
          beforeLock: last.app,
        }
      }

    } else if (record.app === 'UNLOCK') {
      return {
        ...data,
        records,
        locked: false,
        last: {
          ...record,
          // When I unlock my computer in the morning, there isn't a matching
          // LOCK record, so beforeUnlock is undefined.
          app: last.beforeLock || last.app,
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
    app: 'MIDNIGHT',
    title: 'none',
  }
  let data = {
    MIN_TIME: 10,
    today,
    last,
    locked: false,
    records: []
  }

  tail.on('error', err => { throw err })

  tail.on('line', line => {
    data = reducer(data, line)
  })

  let sentData = {}
  function sendReport() {
    const line = JSON.stringify({
      ts: Math.round(Date.now() / 1000),
      app: 'END',
      title: ""
    })

    const tmp = reducer(data, line)

    if (tmp.records !== sentData.records) {
      sentData = tmp
      tmp.records.sort((a, b) => b.total - a.total)
      tmp.records.forEach(record => {
        record.titles.sort((a, b) => b.total - a.total)
      })

      callback(tmp.records)
    }
  }

  // At least report once a minute
  const reportInterval = setInterval(sendReport, 60000)
  let unsubscribe = function () {
    clearInterval(reportInterval)
    tail.stop()
  }

  tail.on('eof', () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (now > today) {
      unsubscribe()
      unsubscribe = gatherUsage(filename, callback)
      return
    }

    sendReport()
  })

  tail.start()

  return () => unsubscribe
}
