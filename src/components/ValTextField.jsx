import React, { Component } from 'react';
import PropTypes from 'prop-types';

import isUndefined from 'lodash.isundefined';

// import Material UI component
import TextField from '@material-ui/core/TextField';
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';

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

    this.Tag = Input;

    if (props.filled && props.outlined)
      throw new Error(`Component ${props.name} can either be outlined or filled, not both`);

    if (props.outlined && !props.filled) this.Tag = OutlinedInput;
    if (props.filled && !props.outlined) this.Tag = FilledInput;

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
    this.validate();
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
    const { Tag } = this;
    const { id, value, name, helperText, ...other } = this.props;

    const errorMessage = this.context.hasError(name) ? this.context.getError(name) : null;
    const formHelperText = errorMessage || helperText || null;

    const ariaHelper = `input_${name}`;

    console.log('### errorMessage: ', errorMessage);

    return (
      <FormControl error={!!errorMessage}>
        <InputLabel htmlFor={id || ariaHelper} />
        <Tag
          value={value}
          id={id || ariaHelper}
          name={name}
          {...other}
          aria-describedby={ariaHelper + '-helperText'}
          onChange={e => this.handleOnChange(e)}
          onBlur={e => this.handleOnBlur(e)}
        />
        {formHelperText && <FormHelperText id={ariaHelper + '-helperText'}>{formHelperText}</FormHelperText>}
      </FormControl>
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
