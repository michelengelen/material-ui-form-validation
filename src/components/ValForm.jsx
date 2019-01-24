import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ValFormContext from 'context/ValFormContext';
import validators from './validators';

/**
 * check if the input component is valid
 * @param   {class}   input
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
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.validateAll = this.validateAll.bind(this);
    this.registerInput = this.registerInput.bind(this);
    this.unregisterInput = this.unregisterInput.bind(this);
    this.isInputRegistered = this.isInputRegistered.bind(this);

    this._inputs = {};

    this.state = {
      _values: {},
      _errors: {},
      validators,
      registerInput: this.registerInput,
      mounted: false,
    };
  }

  componentDidMount() {
    console.log('#### _inputs onMount: ', this._inputs);
    this.setState({ mounted: true });
  }

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

  registerInput(input) {
    const name = validComponent(input);

    console.log('### register input: ', input.props.name);

    this.isInputRegistered(input)
      .then(oldName => {
        this.unregisterInput({ props: { name: oldName } });
      })
      .catch(() => {})
      .finally(() => {
        console.log('### test');
        this._inputs[name] = input;
      });
  }

  unregisterInput(input) {
    const { name } = validComponent(input);
    delete this._inputs[name];
  }

  onSubmit(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    console.log('#### onSubmit: ', this._inputs);

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
    console.log('#### _inputs: ', this._inputs);
    const contextValue = {
      ...this.state,
      _inputs: this._inputs,
    };

    return (
      <ValFormContext.Provider value={contextValue}>
        <form onSubmit={e => this.onSubmit(e)}>
          {this.props.children}
          <button type="submit">test</button>
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
