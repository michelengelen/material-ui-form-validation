import React from 'react';
import PropTypes from 'prop-types';

// import lodash helpers
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';

// import Material UI component
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import IndeterminateCheckbox from '@material-ui/icons/IndeterminateCheckBox';

// import the ValFormContext for registering and validation
import ValFormContext from 'context/ValFormContext';
import ValBase from './ValBase';

const valDefaultProps = {
  iconSize: 'default', // can be 'default', 'small' and 'large'
  falseValue: false,
  trueValue: true,
  label: '',
  labelPlacement: 'end',
  required: false,
  validate: {},
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
};

class ValCheckbox extends ValBase {
  static propTypes = {
    // props that override the Material-UI Inputs props
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    disableRipple: PropTypes.bool,
    icon: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]),
    checkedIcon: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]),
    indeterminate: PropTypes.bool,
    indeterminateIcon: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]),

    // custom props for this implementation (these get "deleted" in getFormControlProps() method)
    iconSize: PropTypes.string,
    falseValue: PropTypes.any,
    trueValue: PropTypes.any,
    label: PropTypes.string,
    labelPlacement: PropTypes.string,
    required: PropTypes.bool,
    validate: PropTypes.object,
    type: PropTypes.string,
  };

  static defaultProps = {
    ...valDefaultProps,
    disabled: false,
    value: '',
    disableRipple: false,
    indeterminate: false,
    icon: CheckBoxOutlineBlankIcon,
    checkedIcon: CheckBoxIcon,
    indeterminateIcon: IndeterminateCheckbox,
    type: 'checkbox',
  };

  static contextType = ValFormContext;

  constructor(props) {
    super(props);

    // check for required prop on the field
    this.isRequired = this.isRequired.bind(this);

    // get refined props
    this.getControlProps = this.getControlProps.bind(this);
    this.getCustomProps = this.getCustomProps.bind(this);

    this.Tag = Checkbox;
  }

  /**
   * get the unformatted value for this field
   * @returns {*}
   */
  getValue() {
    const { value } = this;
    return value;
  }

  /**
   * check if the field is required by any chance
   * @returns {boolean}
   */
  isRequired() {
    const { required } = this.props;
    return required || !!(this.validations.required && this.validations.required.value);
  }

  isChecked() {
    const { trueValue } = this.props;
    return isEqual(this.value, trueValue);
  }

  /**
   * derive material props from the props object
   * @returns {object}
   */
  getControlProps() {
    const clonedProps = cloneDeep(this.props);

    // delete all props that should not be spread down to the underlying Material-UI component
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
      required,
      fontSize,
    } = this.props;

    const customProps = {};

    customProps.required = required || this.isRequired(name);
    customProps.error = !!this.context.submitted && this.context.hasError(name) ? 'Custom ERROR' : undefined;

    customProps.fontSize = fontSize;

    const ariaHelper = `checkBox_${name}`;
    customProps.id = id || ariaHelper;

    return customProps;
  }

  /**
   * render the control
   * @returns {*}
   */
  renderControl() {
    const { Tag } = this;
    const {
      icon, checkedIcon, indeterminate, indeterminateIcon, ...controlProps
    } = this.getControlProps();
    const { fontSize, ...customProps } = this.getCustomProps();

    if (indeterminate) {
      const CustomIndeterminateIcon = indeterminateIcon;
      return (
        <Tag
          {...controlProps}
          checked={this.isChecked()}
          indeterminate
          indeterminateIcon={<CustomIndeterminateIcon fontSize={fontSize} />}
          {...customProps}
        />
      );
    }

    const CustomIcon = icon;
    const CustomCheckedIcon = checkedIcon;

    return (
      <Tag
        {...controlProps}
        checked={this.isChecked()}
        onChange={e => this.handleOnChange(e)}
        icon={<CustomIcon fontSize={fontSize} />}
        checkedIcon={<CustomCheckedIcon fontSize={fontSize} />}
        {...customProps}
      />
    );
  }

  /**
   * react render function
   * @returns {jsx}
   */
  render() {
    const { disabled, label, labelPlacement } = this.props;

    if (label) {
      return (
        <FormControlLabel
          control={this.renderControl()}
          label={label || ''}
          labelPlacement={labelPlacement}
          disabled={disabled}
        />
      );
    }

    return this.renderControl();
  }
}

export default ValCheckbox;
