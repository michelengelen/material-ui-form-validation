import isString from 'lodash.isstring';
import isUndefined from 'lodash.isundefined';

export const isoDateFormat = 'YYYY-MM-DD';

export function isEmpty(value) {
  return (
    isUndefined(value) ||
    value === null ||
    (isString(value) && value.trim() === '') ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  );
}
