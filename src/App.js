/* eslint-disable */
import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import ValForm from 'components/ValForm';
import ValTextField from 'components/ValTextField';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  demo: {
    height: 240,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    height: '100%',
    color: theme.palette.text.secondary,
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      test1: '',
      test2: '',
      test3: '',
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { state } = this;
    const { classes } = this.props;

    return (
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Grid container direction="row" justify="space-evenly" alignItems="stretch" spacing={16}>
            <Grid item xs={3}>
              <Paper className={classes.paper}>
                <ValForm
                  onValidSubmit={() => {
                    console.log('##### VALID SUBMIT');
                  }}
                  onInvalidSubmit={() => {
                    console.log('##### INVALID SUBMIT');
                  }}
                >
                  <ValTextField
                    fullWidth
                    type="text"
                    name="test1"
                    value={state.test1 || ''}
                    label="Input Test 1"
                    onChange={this.handleChange('test1')}
                    errorMessage="PROPS ERRMSG"
                    helperText="helper text 1"
                    validate={{
                      required: {
                        value: true,
                        errorMessage: 'required errorMessage',
                      },
                      minLength: {
                        value: 2,
                        errorMessage: 'minLength errorMessage',
                      },
                      email: {
                        value: true,
                        errorMessage: 'email errorMessage',
                      },
                    }}
                  />
                  <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                  <ValTextField
                    fullWidth
                    outlined
                    required
                    placeholder="placeholder2"
                    type="text"
                    name="test2"
                    label="Input Test 2"
                    helperText="helper text 2"
                    value={state.test2 || ''}
                    onChange={this.handleChange('test2')}
                    validate={{
                      pattern: {
                        value: /^[a-z\d\-_\s]+$/i,
                        errorMessage: 'pattern errorMessage',
                      },
                    }}
                  />
                  <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                  <ValTextField
                    fullWidth
                    filled
                    placeholder="placeholder3"
                    type="text"
                    name="test3"
                    label="Input Test 3"
                    helperText="helper text 3"
                    value={state.test3 || ''}
                    onChange={this.handleChange('test3')}
                  />
                  <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                  <button type="submit">test submit</button>
                </ValForm>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>CheckBox Test</Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>RadioButton Test</Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(App);
