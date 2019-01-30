import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// import lodash helpers
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
import ValBase from './ValBase';

class ValTextField extends ValBase {
  static propTypes = {
    // props that override the Inputs props
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // custom props for this implementation (these get deleted in getMaterialProps() method)
    disabled: PropTypes.bool,
    errorMessage: PropTypes.string,
    falseValue: PropTypes.any,
    filled: PropTypes.bool,
    helperText: PropTypes.string,
    outlined: PropTypes.bool,
    required: PropTypes.bool,
    trueValue: PropTypes.any,
    valueParser: PropTypes.func,
    valueFormatter: PropTypes.func,
    validate: PropTypes.object,
  };

  static defaultProps = {
    value: '',
    trueValue: true,
    falseValue: false,
    validate: {},
    valueParser: x => x,
    valueFormatter: x => x,
    disabled: false,
    errorMessage: '',
    filled: false,
    helperText: '',
    outlined: false,
    required: false,
  };

  constructor(props) {
    super(props);

    this.getValue = this.getValue.bind(this);
    this.getViewValue = this.getViewValue.bind(this);

    this.isRequired = this.isRequired.bind(this);

    // render-methods for sub-components
    this.renderFormLabel = this.renderFormLabel.bind(this);
    this.renderFormHelperText = this.renderFormHelperText.bind(this);

    // get refined props
    this.getMaterialProps = this.getMaterialProps.bind(this);
    this.getCustomProps = this.getCustomProps.bind(this);

    this.Tag = Input;
    this.labelRef = null;

    if (props.filled && props.outlined) throw new Error(`Component ${props.name} can either be outlined or filled, not both`);

    if (props.outlined && !props.filled) this.Tag = OutlinedInput;
    if (props.filled && !props.outlined) this.Tag = FilledInput;
  }

  getValue() {
    return this.props.valueParser ? this.props.valueParser(this.value) : this.value;
  }

  getViewValue() {
    return this.props.valueFormatter ? this.props.valueFormatter(this.value) : this.value;
  }

  isRequired() {
    return this.props.required || !!(this.validations.required && this.validations.required.value);
  }

  getMaterialProps() {
    const clonedProps = cloneDeep(this.props);

    // delete all props that should not be spread down to the underlying Material UI component
    Object.keys(ValTextField.defaultProps).forEach((key) => {
      delete clonedProps[key];
    });

    return clonedProps;
  }

  getCustomProps() {
    const {
      id,
      name,
      helperText,
      label,
      outlined,
      filled,
      required,
      errorMessage,
      disabled,
      readOnly,
    } = this.props;

    const customProps = {};

    customProps.disabled = disabled;
    customProps.readOnly = readOnly;
    customProps.required = required || this.isRequired(name);
    customProps.error = this.context.submitted && this.context.hasError(name);

    const errorText = customProps.error && this.context.getError(name, errorMessage);
    customProps.helperText = errorText || helperText || null;

    customProps.ariaHelper = `input_${name}`;

    customProps.id = id || customProps.ariaHelper;
    customProps.label = label;

    if (outlined) {
      customProps.variant = 'outlined';
      customProps.labelWidth = this.labelRef ? this.labelRef.offsetWidth : 0;
    } else if (filled) {
      customProps.variant = 'filled';
    }

    return customProps;
  }

  renderFormLabel(label) {
    return (
      <InputLabel
        htmlFor={this.getAriaHelper()}
        ref={(ref) => {
          this.labelRef = ReactDOM.findDOMNode(ref);
        }}
      >
        {label}
      </InputLabel>
    );
  }

  renderFormHelperText(helperText) {
    return <FormHelperText id={`${this.getAriaHelper()}-helperText`}>{helperText}</FormHelperText>;
  }

  render() {
    const { Tag } = this;
    const materialProps = this.getMaterialProps();
    const {
      error,
      label,
      variant,
      ariaHelper,
      helperText,
      disabled,
      required,
      ...other
    } = this.getCustomProps();

    const value = this.getViewValue();

    return (
      <FormControl disabled={disabled} error={error} required={required} variant={variant}>
        {label && this.renderFormLabel(label)}
        <Tag
          {...materialProps}
          value={value || ''}
          {...other}
          aria-describedby={`${ariaHelper}-helperText`}
          onChange={e => this.handleOnChange(e)}
          onBlur={e => this.handleOnBlur(e)}
        />
        {helperText && this.renderFormHelperText(helperText)}
      </FormControl>
    );
  }
}

export default ValTextField;
ValTextField.contextType = ValFormContext;
