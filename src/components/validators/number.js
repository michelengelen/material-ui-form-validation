import isNumber from 'lodash.isnumber';
import toNumber from 'lodash.tonumber';
import { isEmpty } from './utils';

const validate = (value, context, { errorMessage = false } = {}) => {
  if (isEmpty(value)) return true;

  const number = toNumber(value);

  return (isNumber(number) && !Number.isNaN(number)) || errorMessage;
};

export default validate;
