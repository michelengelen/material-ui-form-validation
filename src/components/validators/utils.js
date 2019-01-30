import isString from 'lodash.isstring';
import isUndefined from 'lodash.isundefined';

export const isoDateFormat = 'YYYY-MM-DD';

export const isEmpty = value => isUndefined(value)
  || value === null
  || (isString(value) && value.trim() === '')
  || value === false
  || (Array.isArray(value) && value.length === 0);

export const isDecimal = value => value % 1 !== 0;
