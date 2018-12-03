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
import { toTime } from '../utils'

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

  state = {
    date: new Date(),
    data: []
  }

  handleEdit = (app, title) => () => {
    this.props.onEdit({ app, title })
  }

  setDate = (data) => this.setState({ data })

  subscribeToDate() {
    this.unsubscribe = this.props.gatherUsage(this.state.date, this.setDate)
  }

  componentDidMount() {
    this.subscribeToDate()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.date !== this.state.date) {
      this.unsubscribe()
      this.subscribeToDate()
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

  handleNext = () => {
    const tmp = moment(this.state.date).add(1, 'day')

    this.setState({
      data: [],
      date: tmp.toDate()
    })
  }

  handlePrevious = () => {
    const tmp = moment(this.state.date).subtract(1, 'day')

    this.setState({
      data: [],
      date: tmp.toDate()
    })
  }

  renderTitle(data) {
    const date = moment(this.state.date).format('YYYY-MM-DD')
    const total = data.reduce((total, record) => (
      total + record.total
    ), 0)

    console.log('wat?')

    return (
      <div>
        <button onClick={this.handlePrevious}>&lt;</button>
        &nbsp;{date} total: {toTime(total, true)}&nbsp;
        <button onClick={this.handleNext}>&gt;</button>
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
