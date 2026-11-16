const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assertIsolatedDatabase } = require('./browser-test-safety.cjs');

test('rejects existing databases, injected identifiers and names from other test workflows', () => {
  for (const name of ['zero_inventory', 'postgres', 'zero_inventory_test_123', 'zero_inventory_test_browser_1_abcd', 'x";DROP DATABASE postgres;--']) {
    assert.throws(() => assertIsolatedDatabase(name, 'zero_inventory'));
  }
  const name = 'zero_inventory_test_browser_123_abcdef123456';
  assert.throws(() => assertIsolatedDatabase(name, name));
  assert.equal(assertIsolatedDatabase(name, 'zero_inventory'), name);
});
