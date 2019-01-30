import moment from 'moment';
import toNumber from 'lodash.tonumber';
import { isEmpty, isoDateFormat } from './utils';
import minchecked from './minchecked';

const validate = (value, context, constraint = {}, input = {}) => {
  if (Array.isArray(input.value)) {
    return minchecked(value, context, constraint, input);
  }

  if (isEmpty(value)) return true;

  const { validations, props } = input;

  if (
    (validations && validations.date)
    || (props && props.type && props.type.toLowerCase() === 'date')
  ) {
    return (
      moment(value, [isoDateFormat, constraint.format || 'MM/DD/YYYY'], true).isSameOrAfter(
        constraint.value,
        'day',
      )
      || constraint.errorMessage
      || false
    );
  }

  const number = toNumber(value);

  return (
    (!Number.isNaN(number) && Number.isFinite(number) && number >= toNumber(constraint.value))
    || constraint.errorMessage
    || false
  );
};

export default validate;
