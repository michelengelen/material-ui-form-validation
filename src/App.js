import React, { Component } from 'react';
import ValForm from 'components/ValForm';
import ValTextField from 'components/ValTextField';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleChange = name => event => {
    console.log('#### test onChange', name);
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
          name={'test1'}
          value={this.state['test1'] || ''}
          type={'text'}
          onChange={this.handleChange('test1')}
          errormessage="TEST ERRMSG"
          helperText="helper text"
          validate={{
            required: {
              value: true,
              errorMessage: 'required errorMessage'
            },
            minLength: {
              value: 2,
              errorMessage: 'minLength errorMessage'
            },
            email: {
              value: true,
              errorMessage: 'email errorMessage'
            }
          }}
        />
        <ValTextField
          name={'test2'}
          value={this.state['test2'] || ''}
          type={'text'}
          onChange={this.handleChange('test2')}
        />
        <button type="submit">test submit</button>
      </ValForm>
    );
  }
}

export default App;
