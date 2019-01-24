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
      _inputs: {},
      _values: {},
      _errors: {},
      validators,
      registerInput: this.registerInput,
    };
  }

  isInputRegistered(input) {
    for (const key in this._inputs) {
      if (this._inputs[key] === input) {
        return true;
      }
    }

    return false;
  }

  registerInput(input) {
    const name = validComponent(input);

    if (this.isInputRegistered(input)) {
      throw new Error(`### input with name ${name} already exists.`)
    }

    this._inputs[name] = input;
  }

  unregisterInput(input) {

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
    const { formIsValid, errors } = await Object.keys(this.state._inputs).reduce(input => {
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
    console.log('### _inputs: ', this._inputs);
    return (
      <ValFormContext.Provider value={this.state}>
        <form onSubmit={e => this.onSubmit(e)}>{this.props.children}</form>
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
