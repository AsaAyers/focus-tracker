import React, { Component } from 'react';
import { toTime } from '../utils'

function Time(props) {
  return toTime(props.children, props.padding === true)
}

export default class Report extends Component {
  renderRecord = (record) => {
    let titles = record.titles
      .filter((title) => title.total > 60)
      .map(({name, total}) => (
        <li key={name}>
          <Time>{total}</Time>
          {' '}{name}
        </li>
      ))

    return (
      <li key={record.name}>
        <Time padding={true}>{record.total}</Time>
        {' '}{record.name}
        <ul>{titles}</ul>
      </li>
    )
  }

  render() {
    const data = this.props.data
      .filter(d => (
        ['MIDNIGHT', 'LOCK'].indexOf(d.name) === -1
        && d.total > 60
      ))

    const total = data.reduce((total, record) => (
      total + record.total
    ), 0)

    return (
      <div className="report">
        total: <Time>{total}</Time>
        <ul>
          {data.map(this.renderRecord)}
        </ul>
      </div>
    );
  }
}
