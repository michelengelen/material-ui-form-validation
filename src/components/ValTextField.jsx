import React, { Component } from 'react';
import PropTypes from 'prop-types';

import isUndefined from 'lodash.isundefined';

// import Material UI component
import TextField from '@material-ui/core/TextField';

// import the ValFormContext for registering and validation
import ValFormContext from 'context/ValFormContext';

const htmlValidationAttrs = ['min', 'max', 'minLength', 'maxLength', 'pattern', 'required', 'step'];

const htmlValidationTypes = [
  'email',
  'date',
  'datetime',
  'number',
  'tel',
  'url',
  /*'range', 'month', 'week', 'time'*/ // These do not currently have validation
];

class ValTextField extends Component {
  constructor(props) {
    super(props);

    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getViewValue = this.getViewValue.bind(this);
    this.getFieldValue = this.getFieldValue.bind(this);
    this.updateValidations = this.updateValidations.bind(this);
    this.validate = this.validate.bind(this);

    this.validations = {};
    this.value = '';

    this.state = { value: this.props.multiple ? [] : '' };
  }

  componentDidMount() {
    this.value = this.props.value;
    this.setState({ value: this.value });
    this.updateValidations();
  }

  getValue() {
    return this.props.valueParser ? this.props.valueParser(this.value) : this.value;
  }

  getViewValue() {
    return this.props.valueFormatter ? this.props.valueFormatter(this.value) : this.value;
  }

  getFieldValue(event) {
    if (this.props.type === 'checkbox') {
      return event.target.checked ? this.props.trueValue : this.props.falseValue;
    }

    if (this.props.type === 'select' && this.props.multiple) {
      const ret = [];
      const options = event.target.options;
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          ret.push(options[i].value);
        }
      }
      return ret;
    }
    return event && event.target && !isUndefined(event.target.value) ? event.target.value : event;
  }

  updateValidations(props = this.props) {
    this.validations = Object.assign({}, props.validate);

    if (htmlValidationTypes.indexOf(props.type) > -1) {
      this.validations[props.type] = this.validations[props.type] || true;
    }

    Object.keys(props)
      .filter(val => htmlValidationAttrs.indexOf(val) > -1)
      .forEach(attr => {
        if (props[attr]) {
          this.validations[attr] = this.validations[attr] || {
            value: props[attr],
          };
        } else {
          delete this.validations[attr];
        }
      });

    this.context && this.context.registerInput(this);
    this.validate();
  }

  validate() {
    this.context.validate(this.props.name);
  }

  handleOnChange(e) {
    if (e && e.preventDefault && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    this.value = this.getFieldValue(e);

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
  trueValue: PropTypes.any,
  falseValue: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  validations: PropTypes.object,
  valueParser: PropTypes.func,
  valueFormatter: PropTypes.func,
};

ValTextField.defaultProps = {
  trueValue: true,
  falseValue: false,
  value: '',
  validations: {},
  valueParser: x => x,
  valueFormatter: x => x,
};

export default ValTextField;
ValTextField.contextType = ValFormContext;
