import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// import lodash helpers
import isUndefined from 'lodash.isundefined';
import cloneDeep from 'lodash.clonedeep';

// import Material UI component
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
    this.getAriaHelper = this.getAriaHelper.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getViewValue = this.getViewValue.bind(this);
    this.getFieldValue = this.getFieldValue.bind(this);
    this.updateValidations = this.updateValidations.bind(this);
    this.validate = this.validate.bind(this);
    this.isRequired = this.isRequired.bind(this);

    this.renderFormLabel = this.renderFormLabel.bind(this);
    this.renderFormHelperText = this.renderFormHelperText.bind(this);
    this.getDerivedProps = this.getDerivedProps.bind(this);
    this.getCustomProps = this.getCustomProps.bind(this);

    this.validations = {};
    this.value = '';

    this.Tag = Input;
    this.labelRef = null;

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

  getAriaHelper() {
    return this.props.id || `input_${this.props.name}`;
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

  isRequired() {
    return this.props.required || !!(this.validations.required && this.validations.required.value);
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

  getDerivedProps() {
    const clonedProps = cloneDeep(this.props);

    // delete all props that should not be spread down to the underlying Material UI component
    delete clonedProps.errorMessage;
    delete clonedProps.falseValue;
    delete clonedProps.filled;
    delete clonedProps.helperText;
    delete clonedProps.outlined;
    delete clonedProps.required;
    delete clonedProps.trueValue;
    delete clonedProps.valueParser;
    delete clonedProps.valueFormatter;
    delete clonedProps.validate;
  }

  getCustomProps() {
    const { id, name, helperText, label, outlined, filled, required, errorMessage } = this.props;

    const customProps = {};

    customProps.required = required || this.isRequired(name);
    customProps.error = this.context.hasError(name);

    const errorText = customProps.error && this.context.getError(name, errorMessage);
    customProps.formHelperText = errorText || helperText || null;

    customProps.ariaHelper = `input_${name}`;
    customProps.variant = outlined ? 'outlined' : filled ? 'filled' : null;

    customProps.id = id || customProps.ariaHelper;
    customProps.label = label;

    if (outlined) {
      customProps.labelWidth = this.labelRef ? this.labelRef.offsetWidth : 0;
    }

    return customProps;
  }

  renderFormLabel(label) {
    return (
      <InputLabel
        htmlFor={this.getAriaHelper()}
        ref={ref => {
          this.labelRef = ReactDOM.findDOMNode(ref);
        }}
      >
        {label}
      </InputLabel>
    );
  }

  renderFormHelperText(helperText) {
    return <FormHelperText id={this.getAriaHelper() + '-helperText'}>{helperText}</FormHelperText>;
  }

  render() {
    const { Tag } = this;
    const materialProps = this.getDerivedProps();
    const customProps = this.getCustomProps();
    const { label, error, variant, ariaHelper, formHelperText, ...other } = customProps;

    return (
      <FormControl error={error} variant={variant}>
        {label && this.renderFormLabel(label)}
        <Tag
          {...materialProps}
          {...other}
          aria-describedby={ariaHelper + '-helperText'}
          onChange={e => this.handleOnChange(e)}
          onBlur={e => this.handleOnBlur(e)}
        />
        {formHelperText && this.renderFormHelperText(formHelperText)}
      </FormControl>
    );
  }
}

ValTextField.propTypes = {
  // props that override the Inputs props
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // custom props for this implementation (these get deleted in getDerivedProps() method)
  falseValue: PropTypes.any,
  trueValue: PropTypes.any,
  validate: PropTypes.object,
  valueParser: PropTypes.func,
  valueFormatter: PropTypes.func,
};

ValTextField.defaultProps = {
  value: '',
  trueValue: true,
  falseValue: false,
  validate: {},
  valueParser: x => x,
  valueFormatter: x => x,
};

export default ValTextField;
ValTextField.contextType = ValFormContext;
