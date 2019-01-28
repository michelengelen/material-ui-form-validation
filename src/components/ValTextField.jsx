import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import Material UI component
import TextField from '@material-ui/core/TextField';

// import the ValFormContext for registering and validation
import ValFormContext from 'context/ValFormContext';

class ValTextField extends Component {
  constructor(props) {
    super(props);

    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getViewValue = this.getViewValue.bind(this);
  }

  componentDidMount() {
    this.context.registerInput(this);
  }

  getValue() {
    return this.props.valueParser ? this.props.valueParser(this.value) : this.value;
  }

  getViewValue() {
    return this.props.valueFormatter ? this.props.valueFormatter(this.value) : this.value;
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
  validations: PropTypes.object,
  valueParser: PropTypes.func,
  valueFormatter: PropTypes.func,
};

export default ValTextField;
ValTextField.contextType = ValFormContext;
