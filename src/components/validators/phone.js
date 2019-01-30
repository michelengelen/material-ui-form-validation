import patternValidation from './pattern';

const NANP_REGEXP = /^(\+?1[.\-\s]?)?\(?[2-9]\d{2}[).\-\s]?\s?[2-9]\d{2}[.\-\s]?\d{4}$/;

const validate = (value, context, { pattern = NANP_REGEXP, errorMessage = false } = {}) => (
  patternValidation(value, context, { value: pattern, errorMessage })
);

export default validate;
