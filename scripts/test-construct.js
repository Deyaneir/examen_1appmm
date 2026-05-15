const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');

async function run() {
  const cjsConstruct = require('../node_modules/@babel/runtime/helpers/construct.js');
  const esmConstructModule = await import(pathToFileURL(path.resolve('./node_modules/@babel/runtime/helpers/esm/construct.js')).href);
  const esmConstruct = esmConstructModule.default;

class Base {}
class Derived extends Base {
  constructor(value) {
    super();
    this.value = value;
  }
}

  function verifyConstruct(helper) {
    const instance = helper(Derived, ['hello'], Derived);
    assert(instance instanceof Derived, 'instance should be Derived');
    assert(instance instanceof Base, 'instance should also be Base');
    assert.strictEqual(instance.value, 'hello', 'constructor argument should be passed through');
    return instance;
  }

  verifyConstruct(cjsConstruct);
  verifyConstruct(esmConstruct);

  console.log('✅ construct helper works for CJS and ESM');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
