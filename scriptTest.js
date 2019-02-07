const obj = {
  prop1: 'prop1',
  prop2: 'prop2',
  prop3: 'prop3',
  prop4: 'prop4',
  prop5: 'prop5',
};

const { prop2, prop4, ...rest } = obj;

console.log(obj);
console.log(rest);
