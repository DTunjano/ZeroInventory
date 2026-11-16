import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { parseWompiConfig } from '../../../config/wompi.config';
import {
  integrity,
  transactionData,
  transactionId,
  verifiedEvent,
} from './wompi.protocol';
import { SandboxWompiGateway } from '../infrastructure/wompi.gateway';

const settings = {
  WOMPI_MODE: 'sandbox',
  WOMPI_PUBLIC_KEY: 'pub_test_unit_only',
  WOMPI_PRIVATE_KEY: 'prv_test_unit_only',
  WOMPI_INTEGRITY_SECRET: 'test_integrity_unit_only',
  WOMPI_EVENTS_SECRET: 'test_events_unit_only',
  WOMPI_REDIRECT_URL: 'http://localhost:5173/me/orders',
  NODE_ENV: 'test',
};
const transaction = {
  id: '123-test',
  reference: 'zi-test-reference',
  amount_in_cents: 250,
  currency: 'COP',
  status: 'APPROVED',
};
function event(
  properties = [
    'transaction.status',
    'transaction.id',
    'transaction.amount_in_cents',
  ],
) {
  const values = properties.map(
    (property) =>
      transaction[property.split('.')[1] as keyof typeof transaction],
  );
  return {
    event: 'transaction.updated',
    environment: 'test',
    timestamp: 1794700800,
    data: { transaction },
    signature: {
      properties,
      checksum: createHash('sha256')
        .update(`${values.join('')}1794700800${settings.WOMPI_EVENTS_SECRET}`)
        .digest('hex'),
    },
  };
}
describe('Wompi protocol and environment boundary', () => {
  it('is disabled by default and rejects live environments and credentials', () => {
    expect(parseWompiConfig({})).toBeNull();
    expect(parseWompiConfig(settings)?.environment).toBe('sandbox');
    expect(() =>
      parseWompiConfig({ ...settings, WOMPI_MODE: 'production' }),
    ).toThrow('producción');
    for (const key of [
      'WOMPI_PUBLIC_KEY',
      'WOMPI_PRIVATE_KEY',
      'WOMPI_INTEGRITY_SECRET',
      'WOMPI_EVENTS_SECRET',
    ])
      expect(() =>
        parseWompiConfig({ ...settings, [key]: 'live_secret_do_not_echo' }),
      ).toThrow(key);
  });
  it('requires HTTPS except local development and rejects credentials in redirects', () => {
    for (const url of [
      'http://example.test/me/orders',
      'https://user:password@example.test',
      'javascript:alert(1)',
      'https://example.test/#secret',
    ])
      expect(() =>
        parseWompiConfig({ ...settings, WOMPI_REDIRECT_URL: url }),
      ).toThrow('WOMPI_REDIRECT_URL');
    expect(() =>
      parseWompiConfig({ ...settings, NODE_ENV: 'production' }),
    ).toThrow('HTTPS');
    expect(
      parseWompiConfig({
        ...settings,
        NODE_ENV: 'production',
        WOMPI_REDIRECT_URL: 'https://example.test/me/orders',
      }),
    ).not.toBeNull();
  });
  it('signs the immutable reference, COP cents and secret without floating point arithmetic', () => {
    const expected = createHash('sha256')
      .update('zi-test-reference250COPtest_integrity_unit_only')
      .digest('hex');
    expect(
      integrity(transaction.reference, 250, settings.WOMPI_INTEGRITY_SECRET),
    ).toBe(expected);
    expect(
      integrity(transaction.reference, 251, settings.WOMPI_INTEGRITY_SECRET),
    ).not.toBe(expected);
  });
  it('verifies the dynamic property order and rejects altered or non-test events', () => {
    expect(verifiedEvent(event(), settings.WOMPI_EVENTS_SECRET).status).toBe(
      'APPROVED',
    );
    expect(
      verifiedEvent(
        event([
          'transaction.id',
          'transaction.reference',
          'transaction.status',
        ]),
        settings.WOMPI_EVENTS_SECRET,
      ).id,
    ).toBe(transaction.id);
    const altered = event();
    altered.data.transaction = { ...transaction, status: 'DECLINED' };
    expect(() => verifiedEvent(altered, settings.WOMPI_EVENTS_SECRET)).toThrow(
      'Firma',
    );
    expect(() =>
      verifiedEvent(
        { ...event(), environment: 'prod' },
        settings.WOMPI_EVENTS_SECRET,
      ),
    ).toThrow();
    expect(() =>
      verifiedEvent(
        {
          ...event(),
          signature: {
            properties: ['transaction.__proto__.id'],
            checksum: '0'.repeat(64),
          },
        },
        settings.WOMPI_EVENTS_SECRET,
      ),
    ).toThrow();
    expect(() => verifiedEvent(event(), 'wrong-secret')).toThrow();
  });
  it('validates provider identifiers, amounts and currency and strips customer data', () => {
    for (const id of ['../merchants', 'x?secret=y', 'x/y', ''])
      expect(() => transactionId(id)).toThrow();
    for (const amount of [0, -1, 2.5, Number.MAX_SAFE_INTEGER + 1])
      expect(() =>
        transactionData({ ...transaction, amount_in_cents: amount }),
      ).toThrow();
    expect(() =>
      transactionData({ ...transaction, currency: 'USD' }),
    ).toThrow();
    expect(
      transactionData({
        ...transaction,
        customer_email: 'private@example.test',
      }),
    ).not.toHaveProperty('customer_email');
  });
});
describe('Wompi private lookup', () => {
  afterEach(() => jest.restoreAllMocks());
  it('uses only the fixed sandbox host and private authorization', async () => {
    const fetcher = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ data: transaction }), { status: 200 }),
      );
    const result = await new SandboxWompiGateway(
      new ConfigService(settings),
    ).transaction(transaction.id);
    expect(result.status).toBe('APPROVED');
    expect(fetcher).toHaveBeenCalledWith(
      'https://sandbox.wompi.co/v1/transactions/123-test',
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${settings.WOMPI_PRIVATE_KEY}`,
          Accept: 'application/json',
        },
        redirect: 'error',
      }),
    );
  });
  it('fails closed on provider errors, unexpected identity or malformed JSON without exposing secrets', async () => {
    const fetcher = jest.spyOn(global, 'fetch');
    const gateway = new SandboxWompiGateway(new ConfigService(settings));
    fetcher.mockRejectedValueOnce(new Error(settings.WOMPI_PRIVATE_KEY));
    await expect(gateway.transaction(transaction.id)).rejects.toThrow(
      'No se pudo verificar',
    );
    fetcher.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { ...transaction, id: 'another' } })),
    );
    await expect(gateway.transaction(transaction.id)).rejects.toThrow(
      'No se pudo verificar',
    );
    fetcher.mockResolvedValueOnce(new Response('not-json'));
    await expect(gateway.transaction(transaction.id)).rejects.toThrow(
      'No se pudo verificar',
    );
  });
});
