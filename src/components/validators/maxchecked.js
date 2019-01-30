import toNumber from 'lodash.tonumber';
import { isEmpty, isDecimal } from './utils';

const validate = (value, context, constraint = {}, input = {}) => {
  if (isEmpty(input.value)) return true;

  const max = toNumber(constraint.value);

  return (
    (!Number.isNaN(max) && Number.isFinite(max) && !isDecimal(max) && max >= input.value.length)
    || constraint.errorMessage
    || false
  );
};

export default validate;
