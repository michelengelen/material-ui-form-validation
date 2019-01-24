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
      <ValForm>
        <ValTextField name={'test1'} value={this.state['test1'] || ''} onChange={this.handleChange('test1')} />
        <ValTextField name={'test2'} value={this.state['test2'] || ''} onChange={this.handleChange('test2')} />
      </ValForm>
    );
  }
}

export default App;
