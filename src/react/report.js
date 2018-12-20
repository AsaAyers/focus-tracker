import React, { Component } from 'react';
import moment from 'moment'
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import createDebug from 'debug'
import { toTime } from '../utils'

const debug = createDebug('focus-tracker:report')

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  list: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
});

class Report extends Component {

  constructor(props) {
    super(props)
    const date= new Date()
    date.setHours(0, 0, 0, 0)

    this.state = {
      today: date,
      date,
      data: []
    }
  }

  handleEdit = (app, title) => () => {
    this.props.onEdit({ app, title })
  }

  setData = (data) => {
    debug(data)
    this.setState({ data })
  }

  subscribeToDate(date = new Date()) {
    date.setHours(0, 0, 0, 0)

    if (typeof this.unsubscribe === 'function') {
      console.log('unsub', this.unsubscribe.id)
      this.unsubscribe()
    }

    this.unsubscribe = this.props.gatherUsage(date, this.setData)
    this.unsubscribe.id = Math.random()
    this.setState({
      data: [],
      date
    })
  }

  handleNext = () => {
    const tmp = moment(this.state.date).add(1, 'day')

    if (tmp < new Date()) {
      this.subscribeToDate(tmp.toDate())
    }
  }

  handlePrevious = () => {
    const tmp = moment(this.state.date).subtract(1, 'day')
    this.subscribeToDate(tmp.toDate())
  }

  componentDidMount() {
    this.subscribeToDate()
  }

  componentDidUpdate(pervProps, prevState) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // If the date changed...
    if (today > this.state.today) {
      this.setState({
        // correct today
        today,
        // If we were watching yesterday, move it forward automatically.
        date: (this.state.date.getTime() === this.state.today.getTime())
          ? today
          : this.state.date
      })
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  renderRecord = (record) => {
    const { classes } = this.props

    let titles = record.titles
      .filter((title) => title.total > 60 && title.name.length > 0)
      .map((title) => (
        <ListItem key={title.name} button={true} onClick={this.handleEdit([record.app], title.name)}>
          <ListItemText primary={toTime(title.total) + ' ' +title.name} />
        </ListItem>
      ))

    return (
      <ExpansionPanel key={record.app}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>
            {toTime(record.total, true)}{' '}{record.app}
          </Typography>
        </ExpansionPanelSummary>
        {titles.length > 0 &&
        <ExpansionPanelDetails>
          <List className={classes.list} dense={true}>
            {titles}
          </List>
        </ExpansionPanelDetails>
        }
      </ExpansionPanel>
    )
  }


  renderTitle(data) {
    const date = moment(this.state.date).format('YYYY-MM-DD')
    const total = data.reduce((total, record) => (
      total + record.total
    ), 0)

    return (
      <div>
        <button onClick={this.handlePrevious}>&lt;</button>
        &nbsp;{date} total: {toTime(total, true)}&nbsp;
        {this.state.date < this.state.today &&
          <button onClick={this.handleNext}>&gt;</button>
        }
      </div>
    )
  }

  render() {
    const { classes } = this.props
    const data = this.state.data.filter(d => (
      ['MIDNIGHT', 'LOCK'].indexOf(d.app) === -1
      && d.total > 60
    ))

    return (
      <Card className={classes.root}>
        <CardHeader title={
            this.renderTitle(data)
        } />
        {data.map(this.renderRecord)}
      </Card>
    );
  }
}

export default withStyles(styles)(Report);
