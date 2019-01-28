import isRegExp from 'lodash.isregexp';
import { isEmpty } from './utils';

const REGEX = /^\/(.*)\/([gim]*)$/; // regular expression to test a string if it is a properly formatted regular expression

function asRegExp(pattern) {
  // if the given pattern is a valid regex just return it
  if (isRegExp(pattern)) {
    return pattern;
  }

  // if pattern is a string test it for valid regex then convert it and return
  const match = pattern.match(REGEX);
  if (match) {
    return new RegExp(match[1], match[2]);
  }

  return new RegExp(pattern);
}

/**
 * Test the given value with the provided pattern(s)
 *
 * @param   {string}                       value
 * @param   {object}                       context
 * @param   {object}                       [requirement]
 * @param   {(string | boolean | RegExp)}  [requirement.errorMessage]
 * @param   {(string | RegExp)}            [requirement.value]
 * @returns {boolean | string}
 */
const validate = (value, context, requirement = {}) => {
  if (isEmpty(value)) return true;

  const reqValues = Array.isArray(requirement.value) ? requirement.value : [requirement.value];

  return (
    reqValues.some(expression => asRegExp(expression).test(value)) ||
    requirement.errorMessage ||
    false
  );
};

export default validate;
