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
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
});


class App extends Component {
  state = {
    showModal: false,
    tab: (process.env.NODE_ENV === 'development'
      ? 'settings'
      : 'report'
    )
  };

  handleChangeTab = (event, tab) => this.setState({ tab });

  handleShowModal = () => this.setState({ showModal: true })

  handleCloseModal = () => this.setState({ showModal: false })

  createTransform = (transform) => {
    const { saveTransforms, settings } = this.props

    saveTransforms([
      ...settings.transforms,
      transform,
    ])
    this.handleCloseModal()
  }

  renderSettings() {
    const { settings, saveTransforms } = this.props
    return (
      <TabContainer>
        <Settings
          settings={settings}
          saveTransforms={saveTransforms} />
      </TabContainer>
    )
  }

  renderTransformModal() {
    return (
      <EditTransform
        onSave={this.createTransform}
        onCancel={this.handleCloseModal}
        transform={{}} />
    )
  }

  renderAbout() {

    return (
      <TabContainer>
        <a href="https://www.Vecteezy.com">Graphics Provided by vecteezy.com</a>
      </TabContainer>
    )
  }

  render() {
    const { classes } = this.props;
    const { tab, showModal } = this.state;

    console.log(process.env.NODE_ENV)

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
        {tab === "report" && <TabContainer><Report data={this.props.data}/></TabContainer>}
        {tab === "settings" && this.renderSettings()}
        {tab === "about" && this.renderAbout()}
        {showModal && this.renderTransformModal()}
        <Fab onClick={this.handleShowModal} className={classes.fab} color="primary">
          <AddIcon />
        </Fab>
      </div>
    )
  }
}


export default withStyles(styles)(App);
