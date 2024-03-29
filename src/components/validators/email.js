import patternValidation from './pattern';

const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

const validate = (value, context, { pattern = EMAIL_REGEXP, errorMessage = false } = {}) => (
  patternValidation(value, context, { value: pattern, errorMessage })
);

export default validate;
