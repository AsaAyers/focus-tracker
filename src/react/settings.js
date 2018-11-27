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
import EditTransform from './edit-transform'

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
  state = {
    editing: "0aba734f-d983-49a2-b77a-e9ea4c9565da",
    newTransform: false,
  }

  renderClassNames(classNames) {
    const { classes } = this.props;

    return classNames.map(name => (
      <Chip key={name} label={name} className={classes.chip} />
    ))
  }

  handleEdit = (id) => () => {
    this.setState({ editing: id })
  }

  closeEdit = () => this.setState({ editing: null, newTransform: false })

  saveTransform = (transform) => {
    const { settings, saveTransforms } = this.props;
    console.log('transform', transform)
    if (!transform.id) {
      saveTransforms([
        ...settings.transforms,
        transform,
      ])
    }
    saveTransforms(settings.transforms.map(
      t => t.id === transform.id ? transform : t
    ))

    this.closeEdit()
  }

  deleteTransform = (id) => {
    const { settings, saveTransforms } = this.props;
    saveTransforms(settings.transforms.filter(
      t => t.id !== id
    ))
    this.closeEdit()
  }

  renderEdit() {
    const { settings } = this.props
    const { editing, newTransform } = this.state

    let transform = null
    if (editing) {
      transform = settings.transforms.find(t => t.id === editing)
    } else if (newTransform) {
      transform = {}
    }

    if (transform) {
      return (
        <EditTransform
          onSave={this.saveTransform}
          onDelete={this.deleteTransform}
          onCancel={this.closeEdit}
          transform={transform} />
      )
    }

    return null
  }

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
                <TableCell>{this.renderClassNames(n.className || [])}</TableCell>
                <TableCell>{n.replaceTitle}</TableCell>
                <TableCell>{n.replaceClass}</TableCell>
                <TableCell onClick={this.handleEdit(n.id)}><EditIcon/></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {this.renderEdit()}
      </Paper>
    )
  }
}

export default withStyles(styles)(Settings);
