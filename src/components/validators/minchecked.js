import toNumber from 'lodash.tonumber';
import { isEmpty, isDecimal } from './utils';

const validate = (value, context, constraint = {}, input = {}) => {
  if (isEmpty(input.value)) return true;

  const min = toNumber(constraint.value);

  return (
    (!Number.isNaN(min) && Number.isFinite(min) && !isDecimal(min) && min <= input.value.length)
    || constraint.errorMessage
    || false
  );
};

export default validate;
