import React from 'react';

const ValFormContext = React.createContext({
  _inputs: {},
  _values: {},
  _errors: {},
  validators: {},
  getValue: () => {},
  registerInput: () => {},
});

export default ValFormContext;
