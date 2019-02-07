import { Component } from 'react';
import PropTypes from 'prop-types';

// import lodash helpers
import isUndefined from 'lodash.isundefined';
import isEqual from 'lodash.isequal';

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
  /* 'range', 'month', 'week', 'time' */ // These do not currently have validation
];

class ValBase extends Component {
  static propTypes = {
    // props that override the Material-UI Inputs props
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),

    // custom props for this implementation (these get deleted in getMaterialProps() method)
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    falseValue: PropTypes.any,
    id: PropTypes.string,
    multiple: PropTypes.bool,
    required: PropTypes.bool,
    trueValue: PropTypes.any,
    type: PropTypes.string,
  };

  static defaultProps = {
    checked: false,
    defaultChecked: false,
    defaultValue: false,
    falseValue: false,
    id: null,
    multiple: false,
    required: false,
    trueValue: true,
    type: 'textfield',
    value: '',
  };

  static contextType = ValFormContext;

  constructor(props) {
    super(props);

    this.getAriaHelper = this.getAriaHelper.bind(this);

    // value getters
    this.getFieldValue = this.getFieldValue.bind(this);
    this.getDefaultValue = this.getDefaultValue.bind(this);

    // validation
    this.updateValidations = this.updateValidations.bind(this);
    this.validate = this.validate.bind(this);

    // status getter
    this.isRequired = this.isRequired.bind(this);

    // event-handler methods
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);

    this.validations = {};
    this.value = props.multiple ? [] : '';
  }

  componentDidMount() {
    const { value } = this.props;
    this.value = value || this.getDefaultValue();
    this.updateValidations();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { context } = this;
    const {
      checked, name, multiple, value,
    } = this.props;

    if (nextProps.name !== name) {
      context.unregisterInput(this);
    }

    if (nextProps.type === 'checkbox') {
      if (nextProps.checked !== checked) {
        if (nextProps.checked) {
          this.value = nextProps.trueValue;
        } else {
          this.value = nextProps.falseValue;
        }
      }
    } else {
      if (nextProps.multiple !== multiple) {
        this.value = nextProps.multiple ? [] : '';
      }

      if (nextProps.value !== value) {
        this.value = nextProps.value;
      }
    }

    if (!isEqual(nextProps, this.props && !isEqual(nextContext, context))) {
      this.updateValidations(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    const { context } = this;
    const { name } = this.props;
    if (prevProps.name !== name) {
      context.register(this);
    }
  }

  componentWillUnmount() {
    const { context } = this;
    context.unregisterInput(this);
  }

  /**
   * get the string required for the formHelperText reference
   * @returns {ValBase.props.id | string}
   */
  getAriaHelper() {
    const { id, name } = this.props;
    return id || `input_${name}`;
  }

  /**
   * get the defaultValue for the instance
   * @returns {*}
   */
  getDefaultValue() {
    const { context } = this;
    const {
      defaultChecked,
      defaultValue,
      falseValue,
      name,
      multiple,
      trueValue,
      type,
    } = this.props;
    let _defaultValue = '';

    if (type === 'checkbox') {
      if (!isUndefined(defaultChecked)) {
        return defaultChecked ? trueValue : falseValue;
      }
      _defaultValue = falseValue;
    }

    if (type === 'select' && multiple) {
      _defaultValue = [];
    }

    let value = defaultValue || context.getDefaultValue(name);

    if (type === 'checkbox' && value !== trueValue) {
      value = _defaultValue;
    }

    return isUndefined(value) ? defaultValue : value;
  }

  /**
   * get the current fields value (parsed/unformatted if applicable)
   * @param   {object} event
   * @returns {*}
   */
  getFieldValue(event) {
    const {
      falseValue, multiple, trueValue, type,
    } = this.props;
    if (type === 'checkbox') {
      return event.target.checked ? trueValue : falseValue;
    }

    if (type === 'select' && multiple) {
      const ret = [];
      const { options } = event.target;
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          ret.push(options[i].value);
        }
      }
      return ret;
    }
    if (event && event.target && !isUndefined(event.target.value)) {
      return event.target.value;
    }

    event.persist();
    return event;
  }

  /**
   * check if the field is required
   * @returns {ValBase.props.required | boolean}
   */
  isRequired() {
    const { required } = this.props;
    return required || !!(this.validations.required && this.validations.required.value);
  }

  /**
   * update the validations for the instance
   * @param   {object}  props
   */
  updateValidations(props = this.props) {
    const { context } = this;
    this.validations = Object.assign({}, props.validate);

    if (htmlValidationTypes.indexOf(props.type) > -1) {
      this.validations[props.type] = this.validations[props.type] || true;
    }

    Object.keys(props)
      .filter(val => htmlValidationAttrs.indexOf(val) > -1)
      .forEach((attr) => {
        if (Object.prototype.hasOwnProperty.call(props, attr)) {
          this.validations[attr] = this.validations[attr] || {
            value: props[attr],
          };
        } else {
          delete this.validations[attr];
        }
      });

    if (context) context.registerInput(this);
    this.validate();
  }

  /**
   * validate the value of this instance
   */
  validate() {
    const { context } = this;
    const { name } = this.props;
    context.validate(name);
  }

  /**
   * event-handler - handle the value-change of this instance
   * @param   {object}  e - onChange-event
   */
  handleOnChange(e) {
    const { context } = this;
    const { onChange, name } = this.props;

    if (
      e.target.type !== 'checkbox'
      && e
      && e.preventDefault
      && typeof e.preventDefault === 'function'
    ) {
      e.preventDefault();
    }

    this.value = this.getFieldValue(e);

    if (!context.isDirty(name)) context.setDirty(name);
    if (!context.isTouched(name)) context.setTouched(name);
    if (context.submitted) this.validate();
    onChange(e, this.value);
  }

  /**
   * event-handler - handle onBlur event
   * @param   {object}  e - onBlur-event
   */
  handleOnBlur(e) {
    const { context } = this;
    const { name } = this.props;
    if (e && e.preventDefault && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (!context.isTouched(name)) context.setTouched(name);
  }
}

export default ValBase;
