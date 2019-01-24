import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

import ValFormContext from 'context/ValFormContext';

class ValTextField extends Component {
  componentDidMount() {
    console.log('##### context: ', this.props.name);
    this.context.registerInput(this);
  }

  render() {
    const { value, onChange, ...other } = this.props;

    return <TextField value={value} onChange={onChange} {...other} />;
  }
}

ValTextField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ValTextField;
ValTextField.contextType = ValFormContext;
