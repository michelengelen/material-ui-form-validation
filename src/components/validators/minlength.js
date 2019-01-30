import toNumber from 'lodash.tonumber';
import { isEmpty } from './utils';

const validate = (value, context, constraint = {}) => {
  if (isEmpty(value)) return true;

  const { length } = value;

  return length >= toNumber(constraint.value) || constraint.errorMessage || false;
};

export default validate;
