const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/modules/reports/application/report-csv.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const context = { exports: {} };
vm.runInNewContext(code, context);
const { csvCell, reportsCsv } = context.exports;

test('exported untrusted names cannot become spreadsheet formulas', () => {
  for (const value of ['=SUM(1;2)', '+CMD', '-1+2', '@function', '  =formula', '\t=1', '\r=1']) {
    assert.ok(csvCell(value).startsWith('"\''), `Formula left active: ${JSON.stringify(value)}`);
  }
  assert.equal(csvCell('Nombre "QA"; ejemplo'), '"Nombre ""QA""; ejemplo"');
  assert.equal(csvCell(12.5), '"12.5"');
});
test('the CSV includes the applied period, monetary totals and empty sections', () => {
  const csv = reportsCsv({ period: { dateFrom: '2026-11-01', dateTo: '2026-11-12' },
    summary: { orders: 1, orderTotal: 12.5, approvedPayments: 0, pendingPayments: 12.5 },
    daily: [], states: [], methods: [], topProducts: [{ name: '=QA', units: 1, total: 12.5 }],
    inventory: { activeProducts: 0, units: 0, lowStock: [] } });
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes('"2026-11-01";"2026-11-12"'));
  assert.ok(csv.includes('"Pagos internos pendientes";"12.5"'));
  assert.ok(csv.includes('"\'=QA";"1";"12.5"'));
  assert.ok(csv.includes('\r\n'));
});
