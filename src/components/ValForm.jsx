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
function validComponent(input) {
  const name = input && input.props ? input.props.name : undefined;

  if (!name) {
    throw new Error(`Input ${input} has no "name" prop`);
  }

  return name;
}

class ValForm extends Component {
  /**
   * @param   {object}  props
   * @constructor
   */
  constructor(props) {
    super(props);

    // form submit-handling
    this.onSubmit = this.onSubmit.bind(this);

    // form validation handling
    this.validateAll = this.validateAll.bind(this);

    // input un-/registering and checking
    this.registerInput = this.registerInput.bind(this);
    this.unregisterInput = this.unregisterInput.bind(this);
    this.isInputRegistered = this.isInputRegistered.bind(this);

    // input value getters
    this.getValue = this.getValue.bind(this);
    this.getValues = this.getValues.bind(this);

    // input status management
    this.isDirty = this.isDirty.bind(this);
    this.setDirty = this.setDirty.bind(this);
    this.isTouched = this.isTouched.bind(this);
    this.setTouched = this.setTouched.bind(this);

    // error status management
    this.setError = this.setError.bind(this);
    this.hasError = this.hasError.bind(this);

    // static inputs and corresponding updaters
    this._inputs = {};
    this._updater = {};
    this._validators = {};

    this.state = {
      _dirtyInputs: {},
      _touchedInputs: {},
      _errors: {},
      validators,
      registerInput: this.registerInput,
      isDirty: this.isDirty,
      isTouched: this.isTouched,
      setDirty: this.setDirty,
      setTouched: this.setTouched,
    };
  }

  componentDidMount() {}

  /**
   * register an input in the form-Container to handle all actions regarding them
   *
   * @param   {object}  input
   * @param   {object}  updater
   */
  registerInput(input, updater = input && input.setState && input.setState.bind(input)) {
    const name = validComponent(input);

    this.isInputRegistered(input)
      .then(oldName => {
        this.unregisterInput({ props: { name: oldName } });
      })
      .catch(() => {})
      .finally(() => {
        this._inputs[name] = input;
        this._updater[name] = updater;

        if (typeof input.validations === 'object') {
          this._validators[input.props.name] = this.compileValidationRules(input, input.validations);
        }
      });
  }

  /**
   * unregister an input and its corresponding updater
   *
   * @param   {object}  input
   */
  unregisterInput(input) {
    const { name } = validComponent(input);
    delete this._inputs[name];
    delete this._updater[name];
  }

  /**
   * check if an input requesting to be registered is already registered with another name
   * @param   {object}  input
   * @returns {Promise<*>}
   */
  isInputRegistered(input) {
    return new Promise((resolve, reject) => {
      for (const key in this._inputs) {
        if (this._inputs.hasOwnProperty(key) && this._inputs[key] === input) {
          resolve(key);
        }
      }

      reject(null);
    });
  }

  /**
   * check if the input with the given name has an error
   * @param   {string}  inputName
   * @returns {boolean}
   */
  hasError(inputName) {
    return inputName ? !!this.state._errors[inputName] : Object.keys(this.state._errors).length > 0;
  }

  /**
   * check if the input with the given name is dirty
   * @param   {string}  inputName
   * @returns {boolean}
   */
  isDirty(inputName) {
    return inputName
      ? !!this.state._dirtyInputs[inputName]
      : Object.keys(this.state._dirtyInputs).length > 0;
  }

  /**
   * check if the input with the given name was touched before
   * @param   {string}  inputName
   * @returns {boolean}
   */
  isTouched(inputName) {
    return inputName
      ? !!this.state._touchedInputs[inputName]
      : Object.keys(this.state._touchedInputs).length > 0;
  }

  /**
   * set an error to the input with the given errorText
   * @param   {string}              inputName
   * @param   {(boolean | string)}  [error=true]
   * @param   {(boolean | string)}  [errorText=error]
   * @param   {boolean}             [update=true]
   */
  setError(inputName, error = true, errorText = error, update = true) {
    if (error && !isString(errorText) && typeof errorText !== 'boolean') {
      errorText = errorText + '';
    }

    let changed = false;
    const currentError = this.hasError(inputName);
    let _errors = { ...this.state._errors };

    if (
      ((_errors[inputName] === undefined && !error) ||
        _errors[inputName] === (errorText || true)) &&
      error === currentError
    )
      return;
    if (error) {
      _errors[inputName] = errorText || true;
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
   * set an inputs status to 'dirty' (meaning it had/has a value)
   * @param   {(string | string[])}   inputs
   * @param   {boolean}               [dirty=true]
   * @param   {boolean}               [update=true]
   */
  setDirty(inputs, dirty = true, update = true) {
    let _dirtyInputs = { ...this.state._dirtyInputs };
    let changed = false;

    if (!Array.isArray(inputs)) {
      inputs = [inputs];
    }

    inputs.forEach(inputName => {
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
   * set the input status to 'touched' (meaning it was focussed and blurred)
   * @param inputs
   * @param touched
   * @param update
   */
  setTouched(inputs, touched = true, update = true) {
    let _touchedInputs = { ...this.state._touchedInputs };
    let changed = false;

    if (!Array.isArray(inputs)) {
      inputs = [inputs];
    }

    inputs.forEach(inputName => {
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
   *
   * @param   {string}  input
   * @param   {object}  ruleProp
   * @returns {Function}
   */
  compileValidationRules(input, ruleProp) {
    return async (val, context) => {
      if (this.isBad(input.props.name)) {
        return false;
      }

      let result = true;
      const validations = [];

      for (const rule in ruleProp) {
        /* istanbul ignore else  */
        if (ruleProp.hasOwnProperty(rule)) {
          let ruleResult;

          const promise = new Promise((resolve, reject) => {
            const callback = value => resolve({value, rule});

            if (typeof ruleProp[rule] === 'function') {
              ruleResult = ruleProp[rule](val, context, input, callback);
            } else {
              if (typeof AvValidator[rule] !== 'function') {
                return reject(new Error(`Invalid input validation rule: "${rule}"`));
              }

              if (ruleProp[rule].enabled === false) {
                ruleResult = true;
              } else {
                ruleResult = AvValidator[rule](val, context, ruleProp[rule], input, callback);
              }
            }

            if (ruleResult && typeof ruleResult.then === 'function'){
              ruleResult.then(callback);
            } else if (ruleResult !== undefined) {
              callback(ruleResult);
            } else {
              // they are using the callback
            }
          });

          validations.push(promise);
        }
      }

      await Promise.all(validations)
        .then(results => {
          results.every(ruleResult => {
            if (result === true && ruleResult.value !== true) {
              result = isString(ruleResult.value) && ruleResult.value ||
                getInputErrorMessage(input, ruleResult.rule) ||
                getInputErrorMessage(this, ruleResult.rule) || false;
            }
            return result === true;
          });
        });

      return result;
    };
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
   * validate the value of a single input
   * @param   {string}  inputName
   * @param   {object}  context
   * @param   {boolean} update
   * @returns {Promise<boolean>}
   */
  async validateOne(inputName, context, update = true) {
    const input = this._inputs[inputName];

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

  async validateAll(context, update = true) {
    const errors = [];
    let isValid = true;

    for (const inputName in this._inputs) {
      /* istanbul ignore else  */
      if (this._inputs.hasOwnProperty(inputName)) {
        const valid = await this.validateOne(inputName, context, update);
        if (!valid) {
          isValid = false;
          errors.push(inputName);
        }
      }
    }

    if (this.props.validate) {
      let formLevelValidation = this.props.validate;
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
   */
  updateInputs() {
    if (this.throttledUpdateInputs) {
      this.throttledUpdateInputs();
      return;
    }

    // this is just until a more intelligent way to determine which inputs need updated is implemented
    this.throttledUpdateInputs = _throttle(() => {
      Object.keys(this._updater).forEach(
        inputName =>
          this._updater[inputName] &&
          this._inputs[inputName] &&
          this._updater[inputName].call(this._inputs[inputName], {}),
      );
    }, 250);

    this.updateInputs();
  }

  onSubmit(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    this.validateAll().then(({ formIsValid, errors }) => {
      console.log('##### validity of inputs: ', formIsValid);
      console.log('##### errors in form: ', errors);
    });
  }

  async validateAll() {
    console.log('#### async step 1');
    const { formIsValid, errors } = await Object.keys(this._inputs).reduce(input => {
      console.log('#### async step 2');
      console.log('#### input: ', input);
    });
    console.log('#### async step 3');

    return {
      formIsValid,
      errors,
    };
  }

  render() {
    const contextValue = {
      ...this.state,
    };

    return (
      <ValFormContext.Provider value={contextValue}>
        <form onSubmit={e => this.onSubmit(e)}>
          {this.props.children}
        </form>
      </ValFormContext.Provider>
    );
  }
}

ValForm.propTypes = {
  children: PropTypes.node,
  onValidSubmit: PropTypes.func,
  onInvalidSubmit: PropTypes.func,
};

export default ValForm;
