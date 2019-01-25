import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

// import the ValFormContext for registering and validation
import ValFormContext from 'context/ValFormContext';

class ValTextField extends Component {
  constructor(props) {
    super(props);

    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  componentDidMount() {
    this.context.registerInput(this);
  }

  handleOnChange(e) {
    if (e && e.preventDefault && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const { name } = this.props;
    if (!this.context.isDirty(name)) this.context.setDirty(name);
    if (!this.context.isTouched(name)) this.context.setTouched(name);
    this.props.onChange(e);
  }

  handleOnBlur(e) {
    if (e && e.preventDefault && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const { name } = this.props;
    if (!this.context.isTouched(name)) this.context.setTouched(name);
  }

  render() {
    const { value, ...other } = this.props;

    return (
      <TextField
        value={value}
        {...other}
        onChange={e => this.handleOnChange(e)}
        onBlur={e => this.handleOnBlur(e)}
      />
    );
  }
}

ValTextField.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ValTextField;
ValTextField.contextType = ValFormContext;
