import React from 'react';

const ValFormContext = React.createContext({
  _errors: {},
  _badInputs: {},
  _dirtyInputs: {},
  _touchedInputs: {},
  validators: {},
  getValue: () => {},
  registerInput: () => {},
  unregisterInput: () => {},
  validate: () => {},
  isBad: () => {},
  setBad: () => {},
  hasError: () => {},
  setError: () => {},
  getError: () => {},
  isDirty: () => {},
  setDirty: () => {},
  isTouched: () => {},
  setTouched: () => {},
  getDefaultValue: () => {},
});

export default ValFormContext;
