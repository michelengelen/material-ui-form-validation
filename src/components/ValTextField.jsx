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
import ValBaseInput from './ValBaseInput';

const valDefaultProps = {
  value: '',
  trueValue: true,
  falseValue: false,
  disabled: false,
  errorMessage: '',
  filled: false,
  helperText: '',
  outlined: false,
  required: false,
  validate: {},
  valueParser: x => x,
  valueFormatter: x => x,
};

class ValTextField extends ValBaseInput {
  static propTypes = {
    // props that override the Material-UI Inputs props
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    fullWidth: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // custom props for this implementation (these get "deleted" in getMaterialProps() method)
    disabled: PropTypes.bool,
    errorMessage: PropTypes.string,
    falseValue: PropTypes.any,
    filled: PropTypes.bool,
    helperText: PropTypes.string,
    outlined: PropTypes.bool,
    required: PropTypes.bool,
    trueValue: PropTypes.any,
    validate: PropTypes.object,
    valueParser: PropTypes.func,
    valueFormatter: PropTypes.func,
  };

  static defaultProps = {
    ...valDefaultProps,
    fullWidth: false,
  };

  static contextType = ValFormContext;

  constructor(props) {
    super(props);

    // value getters
    this.getValue = this.getValue.bind(this);
    this.getViewValue = this.getViewValue.bind(this);

    // check for required prop on the field
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

  /**
   * get the unformatted value for this field
   * @returns {*}
   */
  getValue() {
    const { valueParser } = this.props;
    return valueParser ? valueParser(this.value) : this.value;
  }

  /**
   * get the formatted value for this field
   * @returns {*}
   */
  getViewValue() {
    const { valueFormatter } = this.props;
    return valueFormatter ? valueFormatter(this.value) : this.value;
  }

  /**
   * derive material props from the props object
   * @returns {object}
   */
  getMaterialProps() {
    const clonedProps = cloneDeep(this.props);

    // delete all props that should not be spread down to the underlying Material UI component
    Object.keys(valDefaultProps).forEach((key) => {
      delete clonedProps[key];
    });

    return clonedProps;
  }

  /**
   * perform actions on the props for rendering it correctly
   */
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

    customProps.isDisabled = disabled;
    customProps.readOnly = readOnly;
    customProps.isRequired = required || this.isRequired(name);
    customProps.hasError = !!this.context.submitted && this.context.hasError(name);

    const errorText = customProps.hasError && this.context.getError(name, errorMessage);
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

  /**
   * render the form label for the field
   * @param   {string}  label
   * @returns {jsx}
   */
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

  /**
   * render the formHelperText component for the field
   * @param   {string}  helperText
   * @returns {jsx}
   */
  renderFormHelperText(helperText) {
    return <FormHelperText id={`${this.getAriaHelper()}-helperText`}>{helperText}</FormHelperText>;
  }

  /**
   * react render function
   * @returns {jsx}
   */
  render() {
    const { Tag } = this;
    const materialProps = this.getMaterialProps();
    const {
      hasError,
      label,
      variant,
      ariaHelper,
      helperText,
      isDisabled,
      isRequired,
      ...other
    } = this.getCustomProps();

    const value = this.getViewValue();

    return (
      <FormControl
        disabled={isDisabled}
        error={hasError}
        required={isRequired}
        variant={variant}
        fullWidth={materialProps.fullWidth}
      >
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
