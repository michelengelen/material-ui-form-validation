import React, { Component } from 'react';
import ValForm from 'components/ValForm';
import ValTextField from 'components/ValTextField';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
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
          name={'test1'}
          value={this.state['test1'] || ''}
          label="Input Test 1"
          onChange={this.handleChange('test1')}
          errorMessage="TEST ERRMSG"
          helperText="helper text 1"
          validate={{
            required: {
              value: ['dependent1', 'dependaent2'],
              errorMessage: 'required errorMessage',
            },
            minLength: {
              value: 2,
              errorMessage: 'minLength errorMessage',
            },
            email: true,
          }}
        />{' '}
        <ValTextField
          required
          outlined
          type="text"
          name="test2"
          label="Input Test 2"
          helperText="helper text 2"
          value={this.state['test2'] || ''}
          onChange={this.handleChange('test2')}
        />{' '}
        <ValTextField
          filled
          type="text"
          name="test3"
          label="Input Test 3"
          helperText="helper text 3"
          value={this.state['test3'] || ''}
          onChange={this.handleChange('test3')}
        />
        <button type="submit">test submit</button>
      </ValForm>
    );
  }
}

export default App;
