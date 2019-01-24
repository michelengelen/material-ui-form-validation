import React from 'react';

const ValFormContext = React.createContext({
  _inputs: {},
  _values: {},
  _errors: {},
  validators: {},
  setValue: () => {},
  getValue: () => {},
  registerInput: () => {},
});

export default ValFormContext;
