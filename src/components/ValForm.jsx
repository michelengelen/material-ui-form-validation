import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import lodash helpers
import _get from 'lodash.get';
import _set from 'lodash.set';
import isString from 'lodash.isstring';
import _throttle from 'lodash.throttle';

// import custom stuff
import ValFormContext from 'context/ValFormContext';
import validators from './validators';

/**
 * check if the input component is valid
 * @param   {object}  input
 * @returns {string}  name
 */
const validComponent = (input) => {
  const name = input && input.props ? input.props.name : undefined;

  if (!name) {
    throw new Error(`Input ${input} has no "name" prop`);
  }

  return name;
};

/**
 * get the error-message from the input
 * @param   {object}  input
 * @param   {string}  ruleName
 * @returns {*}
 */
const getInputErrorMessage = (input, ruleName) => {
  const errorMessage = input && input.props && input.props.errorMessage;

  if (typeof errorMessage === 'object') {
    return errorMessage[ruleName];
  }

  return errorMessage;
};

class ValForm extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    children: PropTypes.node,
    onSubmit: PropTypes.func,
    onValidSubmit: PropTypes.func,
    onInvalidSubmit: PropTypes.func,
    noValidate: PropTypes.bool,
    model: PropTypes.object,
  };

  static defaultProps = {
    disabled: false,
    noValidate: true,
    model: {},
    children: [],
    onSubmit: x => x,
    onValidSubmit: x => x,
    onInvalidSubmit: x => x,
  };

  /**
   * @param   {object}  props
   * @constructor
   */
  constructor(props) {
    super(props);

    // form submit-handling
    this.onSubmit = this.onSubmit.bind(this);

    // form validation handling
    this.validateInput = this.validateInput.bind(this);
    this.validateOne = this.validateOne.bind(this);
    this.validateAll = this.validateAll.bind(this);

    // input un-/registering and checking
    this.registerInput = this.registerInput.bind(this);
    this.unregisterInput = this.unregisterInput.bind(this);
    this.isInputRegistered = this.isInputRegistered.bind(this);

    // input value getters
    this.getDefaultValue = this.getDefaultValue.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getValues = this.getValues.bind(this);

    // input status management
    this.isBad = this.isBad.bind(this);
    this.setBad = this.setBad.bind(this);
    this.isDirty = this.isDirty.bind(this);
    this.setDirty = this.setDirty.bind(this);
    this.isTouched = this.isTouched.bind(this);
    this.setTouched = this.setTouched.bind(this);

    // error status management
    this.hasError = this.hasError.bind(this);
    this.setError = this.setError.bind(this);
    this.getError = this.getError.bind(this);

    // static input storage and corresponding updaters
    this._inputs = {};
    this._updater = {};
    this._validators = {};

    this.state = {
      _errors: {},
      _badInputs: {},
      _dirtyInputs: {},
      _touchedInputs: {},
      validators,
      registerInput: this.registerInput,
      unregisterInput: this.unregisterInput,
      validate: this.validateInput,
      isBad: this.isBad,
      setBad: this.setBad,
      hasError: this.hasError,
      setError: this.setError,
      getError: this.getError,
      isDirty: this.isDirty,
      setDirty: this.setDirty,
      isTouched: this.isTouched,
      setTouched: this.setTouched,
      getDefaultValue: this.getDefaultValue,
    };
  }

  /**
   * the wrapper function for handling the forms submit event
   * @param   {object}  e
   * @returns {Promise<void>}
   */
  async onSubmit(e) {
    const { state } = this;
    const {
      disabled, onValidSubmit, onInvalidSubmit,
    } = this.props;

    // if we have a valid event prevent the default action
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (disabled) {
      return;
    }

    const values = this.getValues();

    // validate all inputs
    const { isValid, errors } = await this.validateAll(values, false);

    // set all inputs to touched state
    this.setTouched(Object.keys(this._inputs), true, false);
    this.updateInputs();

    if (isValid) {
      onValidSubmit(e, values);
    } else {
      onInvalidSubmit(e, errors, values);
    }

    if (!state.submitted) this.setState({ submitted: true });
  }

  /**
   * get the default value for an input from the model
   * @param   {string}  inputName
   * @returns {*}
   */
  getDefaultValue(inputName) {
    const { model } = this.props;
    return _get(model, inputName);
  }

  /**
   * return the value of a single input
   * or if several inputs with the same name are stored throw an error
   * @param   {string}  inputName
   * @returns {*}
   */
  getValue(inputName) {
    const input = this._inputs[inputName];

    if (!input) return undefined;

    if (Array.isArray(input)) {
      throw new Error(`Multiple inputs cannot use the same name: "${inputName}"`);
    }

    return input.getValue();
  }

  /**
   * get all values from stored inputs
   * @returns   {object}  values
   */
  getValues() {
    return Object.keys(this._inputs).reduce((values, inputName) => {
      _set(values, inputName, this.getValue(inputName));

      return values;
    }, {});
  }

  /**
   * set an error to the input with the given errorText
   * @param   {string}              inputName
   * @param   {(boolean|string)}    [error=true]
   * @param   {(boolean|string)}    [errorText=error]
   * @param   {boolean}             [update=true]
   */
  setError(inputName, error = true, errorText = error, update = true) {
    const { state } = this;
    let text = errorText;

    if (error && !isString(errorText) && typeof errorText !== 'boolean') {
      text = errorText.toString();
    }

    let changed = false;
    const hasError = this.hasError(inputName);
    const _errors = { ...state._errors };

    if (
      ((_errors[inputName] === undefined && !error) || _errors[inputName] === (text || true))
      && error === hasError
    ) return;

    if (error) {
      _errors[inputName] = text || true;
      changed = true;
    } else {
      delete _errors[inputName];
      changed = true;
    }

    if (!changed) return;

    this.setState({ _errors }, () => {
      if (update) this.updateInputs();
    });
  }

  /**
   * set the input(s) status to 'dirty' (meaning it had/has a value)
   * @param   {(string|string[])}   inputs
   * @param   {boolean}             [dirty=true]
   * @param   {boolean}             [update=true]
   */
  setDirty(inputs, dirty = true, update = true) {
    const { state } = this;
    const _dirtyInputs = { ...state._dirtyInputs };

    let changed = false;
    let inputArray = inputs;

    if (!Array.isArray(inputs)) {
      inputArray = [inputs];
    }

    inputArray.forEach((inputName) => {
      if (dirty && !_dirtyInputs[inputName]) {
        _dirtyInputs[inputName] = true;
        changed = true;
      } else if (!dirty && _dirtyInputs[inputName]) {
        delete _dirtyInputs[inputName];
        changed = true;
      }
    });

    if (!changed) return;

    this.setState({ _dirtyInputs }, () => {
      if (update) this.updateInputs();
    });
  }

  /**
   * set the input(s) status to 'touched' (meaning it was focussed and blurred)
   * @param   {(string|string[])}   inputs
   * @param   {boolean}             [touched=true]
   * @param   {boolean}             [update=true]
   */
  setTouched(inputs, touched = true, update = true) {
    const { state } = this;
    const _touchedInputs = { ...state._touchedInputs };

    let changed = false;
    let inputArray = inputs;

    if (!Array.isArray(inputs)) {
      inputArray = [inputs];
    }

    inputArray.forEach((inputName) => {
      if (touched && !_touchedInputs[inputName]) {
        _touchedInputs[inputName] = true;
        changed = true;
      } else if (!touched && _touchedInputs[inputName]) {
        delete _touchedInputs[inputName];
        changed = true;
      }
    });

    if (!changed) return;

    this.setState({ _touchedInputs }, () => {
      if (update) this.updateInputs();
    });
  }

  /**
   * set the input(s) status to 'touched' (meaning it was focussed and blurred)
   * @param   {(string|string[])}   inputs
   * @param   {boolean}             [isBad=true]
   * @param   {boolean}             [update=true]
   */
  setBad(inputs, isBad = true, update = true) {
    const { state } = this;
    const _badInputs = { ...state._badInputs };

    let changed = false;
    let inputArray = inputs;

    if (!Array.isArray(inputs)) {
      inputArray = [inputs];
    }

    inputArray.forEach((inputName) => {
      if (isBad && !_badInputs[inputName]) {
        _badInputs[inputName] = true;
        changed = true;
      } else if (!isBad && _badInputs[inputName]) {
        delete _badInputs[inputName];
        changed = true;
      }
    });

    if (!changed) return;

    this.setState({ _badInputs }, () => {
      if (update) this.updateInputs();
    });
  }

  /**
   * get the error message set in the validator or in the props of the component
   * @param   {string}  inputName
   * @param   {string}  errorMessage
   * @returns {boolean|string|string|RegExp}
   */
  getError(inputName, errorMessage = 'Field is invalid') {
    const { state } = this;
    return isString(state._errors[inputName])
      ? state._errors[inputName]
      : errorMessage;
  }

  /**
   * check if the input with the given name is dirty
   * @param   {string}  inputName
   * @returns {boolean}
   */
  isDirty(inputName) {
    const { state } = this;
    return inputName ? !!state._dirtyInputs[inputName] : Object.keys(state._dirtyInputs).length > 0;
  }

  /**
   * check if the input with the given name was touched before
   * @param   {string}  inputName
   * @returns {boolean}
   */
  isTouched(inputName) {
    const { state } = this;
    return inputName
      ? !!state._touchedInputs[inputName]
      : Object.keys(state._touchedInputs).length > 0;
  }

  /**
   * check if the input with the given name is bad
   * @param   {string}  inputName
   * @returns {boolean}
   */
  isBad(inputName) {
    const { state } = this;
    return inputName ? !!state._badInputs[inputName] : Object.keys(state._badInputs).length > 0;
  }

  /**
   * check if the input with the given name has an error
   * @param   {string}  inputName
   * @returns {boolean}
   */
  hasError(inputName) {
    const { state } = this;
    return inputName ? !!state._errors[inputName] : Object.keys(state._errors).length > 0;
  }

  /**
   * prepare all validation rules for the given input
   * @param   {object}  input
   * @param   {object}  ruleProp
   * @returns {Function}
   */
  compileValidationRules(input, ruleProp) {
    return async (val, context) => {
      if (this.isBad(input.props.name)) {
        return false;
      }

      let result = true;

      const validations = Object.keys(ruleProp).map((rule) => {
        if (Object.prototype.hasOwnProperty.call(ruleProp, rule)) {
          let ruleResult;

          return new Promise((resolve, reject) => {
            const callback = value => resolve({ value, rule });

            if (typeof ruleProp[rule] === 'function') {
              ruleResult = ruleProp[rule](val, context, input, callback);
            } else {
              if (typeof validators[rule] !== 'function') {
                return reject(new Error(`Invalid input validation rule: "${rule}"`));
              }

              if (ruleProp[rule].enabled === false) {
                ruleResult = true;
              } else {
                ruleResult = validators[rule](val, context, ruleProp[rule], input, callback);
              }
            }

            if (ruleResult && typeof ruleResult.then === 'function') {
              return ruleResult.then(callback);
            }

            return callback(ruleResult);
          });
        }
        return null;
      });

      await Promise.all(validations).then((results) => {
        results.every((ruleResult) => {
          if (result === true && ruleResult.value !== true) {
            result = (isString(ruleResult.value) && ruleResult.value)
              || getInputErrorMessage(input, ruleResult.rule)
              || getInputErrorMessage(this, ruleResult.rule)
              || false;
          }
          return result === true;
        });
      });

      return result;
    };
  }

  /**
   * check if an input requesting to be registered is already registered with another name
   * @param   {object}  input
   * @returns {Promise<*>}
   */
  isInputRegistered(input) {
    return new Promise((resolve, reject) => {
      Object.keys(this._inputs).forEach((key) => {
        if (
          Object.prototype.hasOwnProperty.call(this._inputs, key)
          && this._inputs[key] === input
        ) {
          resolve(key);
        }
      });
      reject('input is not registered');
    });
  }

  /**
   * unregister an input and its corresponding updater
   * @param   {object}  input
   */
  unregisterInput(input) {
    const { name } = validComponent(input);
    delete this._inputs[name];
    delete this._updater[name];
  }

  /**
   * register an input in the form-Container to handle all actions regarding them
   * @param   {object}  input
   * @param   {object}  updater
   */
  async registerInput(input, updater = input && input.setState && input.setState.bind(input)) {
    const name = validComponent(input);

    this.isInputRegistered(input)
      .then((oldName) => {
        this.unregisterInput({ props: { name: oldName } });
      })
      .finally(() => {
        this._inputs[name] = input;
        this._updater[name] = updater;

        if (typeof input.validations === 'object') {
          this._validators[input.props.name] = this.compileValidationRules(
            input,
            input.validations,
          );
        }
      });
  }

  /**
   * validate the value of a single input (this method gets passed down to the context)
   * @param   {string}  inputName
   * @returns {Promise<void>}
   */
  async validateInput(inputName) {
    await this.validateOne(inputName, this.getValues());
  }

  /**
   * validate the value of a single input
   * @param   {string}  inputName
   * @param   {object}  context
   * @param   {boolean} [update=true]
   * @returns {Promise<boolean>}
   */
  async validateOne(inputName, context, update = true) {
    const input = this._inputs[inputName];

    if (!input) return true;

    if (Array.isArray(input)) {
      throw new Error(`Multiple inputs cannot use the same name: "${inputName}"`);
    }

    const value = _get(context, inputName);
    const validate = input.validations;
    let isValid = true;
    let result;
    let error;

    if (typeof validate === 'function') {
      result = await validate(value, context, input);
    } else if (typeof validate === 'object') {
      result = await this._validators[inputName](value, context);
    } else {
      result = true;
    }

    if (result !== true) {
      isValid = false;

      if (isString(result)) {
        error = result;
      }
    }

    this.setError(inputName, !isValid, error, update);

    return isValid;
  }

  /**
   * validate all registered inputs
   * gets called from the onSubmit method
   * @param   {object}  context
   * @param   {boolean} update
   * @returns {Promise<{isValid: boolean, errors: Array}>}
   */
  async validateAll(context, update = true) {
    const { props, _inputs } = this;
    const errors = [];
    let isValid = true;

    const inputNames = Object.keys(_inputs);

    for (let i = 0; i < inputNames.length; i++) {
      if (Object.prototype.hasOwnProperty.call(_inputs, inputNames[i])) {
        const valid = await this.validateOne(inputNames[i], context, update);
        if (!valid) {
          isValid = false;
          errors.push(inputNames[i]);
        }
      }
    }

    if (props.validate) {
      let formLevelValidation = props.validate;
      if (!Array.isArray(formLevelValidation)) {
        formLevelValidation = [formLevelValidation];
      }

      if (!formLevelValidation.every(validationFn => validationFn(context))) {
        isValid = false;
        errors.push('*');
      }
    }

    return {
      isValid,
      errors,
    };
  }

  /**
   * update all inputs
   * @recursive
   */
  updateInputs() {
    if (this.throttledUpdateInputs) {
      this.throttledUpdateInputs();
      return;
    }

    // this is just until a more intelligent way to
    // determine which inputs need updated is implemented
    this.throttledUpdateInputs = _throttle(() => {
      Object.keys(this._updater).forEach(
        inputName => this._updater[inputName]
          && this._inputs[inputName]
          && this._updater[inputName].call(this._inputs[inputName], {}),
      );
    }, 250);

    this.updateInputs();
  }

  /**
   * react render function
   * @returns {jsx}
   */
  render() {
    const { state } = this;
    const { noValidate, children } = this.props;

    return (
      <ValFormContext.Provider value={state}>
        <form onSubmit={e => this.onSubmit(e)} noValidate={noValidate}>
          {children}
        </form>
      </ValFormContext.Provider>
    );
  }
}

export default ValForm;
