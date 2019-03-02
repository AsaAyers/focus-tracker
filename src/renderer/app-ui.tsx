import * as React from 'react'
import { WithStyles, createStyles } from '@material-ui/core'
import { withStyles, Theme  } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import { Transform } from '../constants'
import Report from './tabs/report'


const styles = (theme: Theme) => createStyles({
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


export enum SelectedTab {
  Report,
  Settings,
  About,
}

interface Props extends WithStyles<typeof styles> {
  tab: SelectedTab,
  editTransform: Partial<Transform> | null,
  setEditTransform: (transform: Partial<Transform>) => any,
  setTab: (tab: SelectedTab) => void
}

const AppUI: React.FC<Props> = function(props) {

  const handleChangeTab = React.useCallback(
    (event, tab) => props.setTab(tab),
    [props.setTab]
  )

  const handleEdit = React.useCallback(
    (transform) => props.setEditTransform(transform),
    [props.setEditTransform]
  )

  const handleNewTransform = React.useCallback(
    () => handleEdit({}),
    [handleEdit]
  )

  return (
    <div className={props.classes.root}>
      <CssBaseline />
      <AppBar position="static">
        <Tabs value={props.tab} onChange={handleChangeTab}>
          <Tab value={SelectedTab.Report} label="Report" />
          <Tab value={SelectedTab.Settings} label="Settings" />
          <Tab value={SelectedTab.About} label="About" />
        </Tabs>
      </AppBar>
      <Typography component="div" style={{ padding: 8 * 3 }}>
          {props.tab === SelectedTab.Report
            && <Report gatherUsage={props.gatherUsage} onEdit={handleEdit}/>}
      </Typography>
      <Fab
        onClick={handleNewTransform}
        className={props.classes.fab}
        color="primary">
        <AddIcon />
      </Fab>
    </div>
  )
}

export default withStyles(styles)(AppUI);
