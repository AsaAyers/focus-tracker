import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Report from './report'
import Settings from './settings'
import EditTransform from './edit-transform'

// https://material-ui.com/style/typography/#migration-to-typography-v2
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}
const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
});


class App extends Component {
  state = {
    tab: (process.env.NODE_ENV === 'development'
      ? 'report'
      : 'report'
    )
  };

  handleChangeTab = (event, tab) => this.setState({ tab });

  handleShowModal = () => this.setState({ editTransform: {} })

  handleEdit = (transform) => this.setState({ editTransform: transform })

  handleCloseModal = () => this.setState({ editTransform: null })

  saveTransform = (transform) => {
    const { settings, saveTransforms } = this.props;
    if (!transform.id) {
      saveTransforms([
        ...settings.transforms,
        transform,
      ])
    } else {
      saveTransforms(settings.transforms.map(
        t => t.id === transform.id ? transform : t
      ))
    }

    this.handleCloseModal()
  }

  deleteTransform = (id) => {
    const { settings, saveTransforms } = this.props;
    saveTransforms(settings.transforms.filter(
      t => t.id !== id
    ))
    this.handleCloseModal()
  }

  renderSettings() {
    const { settings } = this.props
    return (
      <TabContainer>
        <Settings
          onEdit={this.handleEdit}
          settings={settings} />
      </TabContainer>
    )
  }

  renderTransformModal() {
    return (
      <EditTransform
        onSave={this.saveTransform}
        onDelete={this.deleteTransform}
        onCancel={this.handleCloseModal}
        transform={this.state.editTransform} />
    )
  }

  renderAbout() {

    return (
      <TabContainer>
        <a href="https://www.Vecteezy.com">Graphics Provided by vecteezy.com</a>
      </TabContainer>
    )
  }

  renderReport() {
    let { data } = this.props
    return (
      <TabContainer>
        <Report data={data} onEdit={this.handleEdit}/>
      </TabContainer>
    )
  }

  render() {
    const { classes } = this.props;
    const { tab, editTransform } = this.state;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="static">
          <Tabs value={tab} onChange={this.handleChangeTab}>
            <Tab value="report" label="Report" />
            <Tab value="settings" label="Settings" />
            <Tab value="about" label="About" />
          </Tabs>
        </AppBar>
        {tab === "report" && this.renderReport()}
        {tab === "settings" && this.renderSettings()}
        {tab === "about" && this.renderAbout()}
        {editTransform && this.renderTransformModal()}
        <Fab onClick={this.handleShowModal} className={classes.fab} color="primary">
          <AddIcon />
        </Fab>
      </div>
    )
  }
}


export default withStyles(styles)(App);
