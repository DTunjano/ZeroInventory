const pattern = /^zero_inventory_test_browser_\d+_[a-f0-9]{12}$/;

function assertIsolatedDatabase(name, original) {
  if (!pattern.test(name) || name === original) {
    throw new Error('Las pruebas de navegador requieren una DB temporal propia');
  }
  return name;
}

module.exports = { assertIsolatedDatabase };
