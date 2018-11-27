import React from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


class EditTransform extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      transform: {
        title: "",
        replaceTitle: "",
        replaceApp: "",
        ...props.transform,
        app: (props.transform.app||[]).join(', ')
      }
    }
  }

  onChange = (field) => (e) => {
    const transform = {
      ...this.state.transform,
      [field]: e.target.value
    }
    this.setState({ transform })
  }

  handleDelete = () => {
    const { transform, onDelete } = this.props
    onDelete(transform.id)
  }

  handleSave = () => {
    const { transform } = this.state

    if (transform.title.trim().length === 0) {
      return this.setState({ error: 'title' })
    }

    this.props.onSave(this.state.transform)
  }

  render() {
    const { onCancel } = this.props
    const { transform } = this.state

    return (
      <Dialog
        open={true}
        onClose={onCancel}
        aria-labelledby="form-dialog-title"
        >
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send
            updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            required={true}
            error={this.state.error === 'title'}
            label="Match Title (RegEx)"
            value={transform.title}
            onChange={this.onChange('title')}
            fullWidth
            />
          <TextField
            margin="dense"
            id="app"
            label="Apps (comma separated)"
            value={transform.app}
            onChange={this.onChange('app')}
            fullWidth
            />
          <TextField
            margin="dense"
            id="replaceTitle"
            error={this.state.error === 'replaceTitle'}
            label="Replace Title"
            value={transform.replaceTitle}
            onChange={this.onChange('replaceTitle')}
            fullWidth
            />
          <TextField
            margin="dense"
            id="replaceApp"
            label="Replace App (optional)"
            value={transform.replaceApp}
            onChange={this.onChange('replaceApp')}
            fullWidth
            />
        </DialogContent>
        <DialogActions>
          {transform.id &&
            <Button onClick={this.handleDelete} color="secondary">
              Delete
            </Button>
          }
          <Button onClick={onCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSave} color="primary">
            {transform.id ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default EditTransform
