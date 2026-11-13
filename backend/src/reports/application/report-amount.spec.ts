import { reportAmount } from './report-amount';

describe('Report monetary aggregates', () => {
  it('preserves cents and permits a sum larger than a single persisted row', () => {
    expect(reportAmount('1200000000000.12')).toBe(1200000000000.12);
    expect(reportAmount('0.10')).toBe(0.1);
    expect(reportAmount('0')).toBe(0);
  });
  it.each(['90071992547409.92', '-0.10', 'NaN', '1.001'])('rejects unsafe or invalid aggregate %s', (value) => {
    expect(() => reportAmount(value)).toThrow();
  });
});
