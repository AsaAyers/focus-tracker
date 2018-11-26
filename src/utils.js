
function toTime(seconds, padding = false) {
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  minutes %= 60

  minutes = String(minutes)
  if (padding) {
    hours = String(hours).padStart(2, '0')
  }

  if (hours > 0 || padding) {
    return `${hours}:${minutes.padStart(2, '0')}`
  }
  return `${minutes.padStart(2, '0')}`
}

module.exports = {
  toTime,
}
