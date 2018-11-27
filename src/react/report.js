import React, { Component } from 'react';
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

  handleEdit = (app, title) => () => {
    this.props.onEdit({ app, title })
  }

  renderRecord = (record) => {
    const { classes } = this.props

    let titles = record.titles
      .filter((title) => title.total > 60)
      .map(({name, total}) => (
        <ListItem key={name} button={true} onClick={this.handleEdit([record.name], name)}>
          <ListItemText primary={toTime(total) + ' ' +name} />
        </ListItem>
      ))

    return (
      <ExpansionPanel key={record.name}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>
            {toTime(record.total, true)}{' '}{record.name}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List className={classes.list} dense={true}>
            {titles}
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }

  render() {
    const { classes } = this.props
    const data = this.props.data
      .filter(d => (
        ['MIDNIGHT', 'LOCK'].indexOf(d.name) === -1
        && d.total > 60
      ))

    const total = data.reduce((total, record) => (
      total + record.total
    ), 0)

    return (
      <Card className={classes.root}>
        <CardHeader title={ 'total: ' + toTime(total) } />
        {data.map(this.renderRecord)}
      </Card>
    );
  }
}

export default withStyles(styles)(Report);
