import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
