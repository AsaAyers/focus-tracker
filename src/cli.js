const program = require('commander')
const gatherUsage = require('./electron/gather-usage')
const { toTime } = require('./utils')
const { LOGFILE } = require('./constants')

program
  .version('0.1.0')
  .option('--tail', 'tail')
  .parse(process.argv)


if (program.tail) {
  // https://github.com/jaagr/polybar/wiki/Formatting#foreground-color-f
  const reset = '%{F-}'
  const red = '%{F#f00}'

  gatherUsage(LOGFILE, (data) => {
    const report = data
      .filter(d => (
        ['MIDNIGHT', 'LOCK'].indexOf(d.app) === -1
        && d.total > 60
      ))
      .map(record => `${record.app} ${toTime(record.total)}`)
    report.length = Math.min(report.length, 3)

    // eslint-disable-next-line no-shadow
    const total = data.reduce((total, record) => (
      total + record.total
    ), 0)

    if (report.length === 0) {
      report.push(`${red}Nothing found`)
    } else {
      report.unshift(`TOTAL ${toTime(total, true)}`)
    }

    // eslint-disable-next-line no-console
    console.log(report.join(` ${reset}| `))
  })

} else {
  require('./electron/starter')
}
