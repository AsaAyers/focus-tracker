import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import EditIcon from '@material-ui/icons/Edit';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  chip: {
    margin: theme.spacing.unit,
  },
});

class Settings extends React.PureComponent {
  renderApps(apps) {
    const { classes } = this.props;

    return apps.map(app => (
      <Chip key={app} label={app} className={classes.chip} />
    ))
  }

  handleEdit = (transform) => () => this.props.onEdit(transform)

  render() {
    const { classes, settings } = this.props;
    if (!Array.isArray(settings.transforms)) {
      return (<div>Loading...</div>)
    }
    console.log(settings)

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Match Title</TableCell>
              <TableCell>Match Class</TableCell>
              <TableCell>Replace Title</TableCell>
              <TableCell>Replace Class</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.transforms.map((n) => (
              <TableRow key={n.id}>
                <TableCell component="th" scope="row">
                  {n.title}
                </TableCell>
                <TableCell>{this.renderApps(n.app || [])}</TableCell>
                <TableCell>{n.replaceTitle}</TableCell>
                <TableCell>{n.replaceApp}</TableCell>
                <TableCell onClick={this.handleEdit(n)}><EditIcon/></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    )
  }
}

export default withStyles(styles)(Settings);
