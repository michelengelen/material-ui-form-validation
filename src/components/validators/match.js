import _get from 'lodash.get';
import { isEmpty } from './utils';

const validate = (value, context, constraint = {}) => (
  isEmpty(value) || value === _get(context, constraint.value) || constraint.errorMessage || false
);

export default validate;
