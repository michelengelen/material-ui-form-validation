import { isEmpty } from './utils';
import _get from 'lodash.get';

export default function validate(value, context, constraint = {}) {
  return isEmpty(value) || value === _get(context, constraint.value) || constraint.errorMessage || false;
}
