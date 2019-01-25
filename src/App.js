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
      <ValForm>
        <ValTextField name={'test1'} value={this.state['test1'] || ''} onChange={this.handleChange('test1')} />
        <ValTextField name={'test2'} value={this.state['test2'] || ''} onChange={this.handleChange('test2')} />
        <button type="submit">test submit</button>
      </ValForm>
    );
  }
}

export default App;
