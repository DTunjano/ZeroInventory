const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/modules/products/application/sort-catalog-products.ts'), 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const products = [{nombre:'Vaso',cantidad:200},{nombre:'Shaker',cantidad:0},{nombre:'Cuchara',cantidad:1}];
for (const [sort, order, expected] of [
  ['nombre','asc',['Cuchara','Shaker','Vaso']], ['nombre','desc',['Vaso','Shaker','Cuchara']],
  ['stock','asc',['Shaker','Cuchara','Vaso']], ['stock','desc',['Vaso','Cuchara','Shaker']],
  [undefined,'desc',['Vaso','Cuchara','Shaker']],
]) test(`catalog ${sort ?? 'default'} ${order} respects explicit sorting across stock states`, () => {
  assert.deepEqual(Array.from(context.exports.sortCatalogProducts(products,sort,order), p=>p.nombre),expected);
  assert.deepEqual(products.map(p=>p.nombre),['Vaso','Shaker','Cuchara']);
});
