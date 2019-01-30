import { isEmpty } from './utils';

const validate = (value, context, { value: enabled = true, errorMessage = false } = {}) => (
  !enabled || !isEmpty(value) || errorMessage || false
);

export default validate;
