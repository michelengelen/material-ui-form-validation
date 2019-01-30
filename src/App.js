/* eslint-disable */
import React, { Component } from 'react';
import ValForm from 'components/ValForm';
import ValTextField from 'components/ValTextField';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      test1: '',
      test2: '',
      test3: '',
    };
  }

  handleChange = name => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { state } = this;
    return (
      <ValForm
        onValidSubmit={() => {
          console.log('##### VALID SUBMIT');
        }}
        onInvalidSubmit={() => {
          console.log('##### INVALID SUBMIT');
        }}
      >
        <ValTextField
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
            },
          }}
        />
        {' '}
        <ValTextField
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
        {' '}
        <ValTextField
          filled
          placeholder="placeholder3"
          type="text"
          name="test3"
          label="Input Test 3"
          helperText="helper text 3"
          value={state.test3 || ''}
          onChange={this.handleChange('test3')}
        />
        <button type="submit">test submit</button>
      </ValForm>
    );
  }
}

export default App;
