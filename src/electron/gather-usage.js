const Tail = require('tail-file')
const createDebug = require('debug')
const moment = require('moment')
const uuid = require('uuid/v4')
const runReplacements = require('./run-replacements')
const { LOGFILE } = require('../constants')

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

function reducer(data, parsedLine) {
  const { last } = data

  if (parsedLine.ts > 0 && parsedLine.ts >= last.ts && parsedLine.ts <= data.endOfDay) {
    const record = runReplacements(parsedLine)
    if (last.app === record.app && last.title === record.title) {
      return data
    }

    const time = record.ts - last.ts
    if (time < data.MIN_TIME) {
      return data
    }

    debugLine(time, parsedLine)
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
      // console.log('records', records)
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

    return {
      ...data,
      records,
      last : record
    }
  }

  return data
}

module.exports = function gatherUsage(date, callback) {
  const id = uuid()
  console.log('tail', LOGFILE, id)
  const tail = new Tail(LOGFILE, {
    startPos: 0
  })
  date.setHours(0, 0, 0, 0)

  let last = {
    ts: Math.round(date.getTime() / 1000),
    app: 'MIDNIGHT',
    title: 'none',
  }
  date.setHours(24, 0, 0, 0)


  let data = {
    MIN_TIME: 10,
    endOfDay: Math.round(date.getTime() / 1000),
    last,
    records: []
  }

  let sentData = {}
  function sendReport() {
    const line = {
      ts: Math.round(Date.now() / 1000),
      app: 'END',
      title: ""
    }

    const tmp = reducer(data, line)

    if (tmp.records !== sentData.records) {
      sentData = tmp
      tmp.records.sort((a, b) => b.total - a.total)
      tmp.records.forEach(record => {
        record.titles.sort((a, b) => b.total - a.total)
      })

      console.log('send', moment(date).format('YYYY-MM-DD'), id)

      callback(tmp.records)
    }
  }

  // At least report once a minute
  let reportInterval = setInterval(sendReport, 60000)
  let done = false
  let unsubscribe = function () {
    if (done) return
    done = true
    tail.stop()
    clearInterval(reportInterval)
  }

  tail.on('error', err => { throw err })

  tail.on('line', line => {
    const parsedLine = parseLine(line)
    if (parsedLine.ts > data.endOfDay && !done) {
      console.log('end of day unsubscribe')
      sendReport()
      unsubscribe()
    }
    data = reducer(data, parsedLine)
  })

  tail.on('eof', () => {
    sendReport()
  })

  tail.start()

  return () => unsubscribe
}
