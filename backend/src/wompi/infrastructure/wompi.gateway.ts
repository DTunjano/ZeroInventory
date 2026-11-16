import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseWompiConfig } from '../../../config/wompi.config';
import { WompiGateway, WompiTransaction } from '../domain/wompi.types';
import { transactionData, transactionId } from '../application/wompi.protocol';

@Injectable()
export class SandboxWompiGateway implements WompiGateway {
  constructor(private readonly config: ConfigService) {}
  async transaction(id: string): Promise<WompiTransaction> {
    transactionId(id);
    const options = parseWompiConfig(
      Object.fromEntries(
        [
          'WOMPI_MODE',
          'WOMPI_PUBLIC_KEY',
          'WOMPI_PRIVATE_KEY',
          'WOMPI_INTEGRITY_SECRET',
          'WOMPI_EVENTS_SECRET',
          'WOMPI_REDIRECT_URL',
          'NODE_ENV',
        ].map((key) => [key, this.config.get(key)]),
      ),
    );
    if (!options)
      throw new ServiceUnavailableException(
        'Wompi Sandbox no está configurado',
      );
    try {
      const response = await fetch(
        `https://sandbox.wompi.co/v1/transactions/${encodeURIComponent(id)}`,
        {
          headers: {
            Authorization: `Bearer ${options.privateKey}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(10000),
          redirect: 'error',
        },
      );
      if (!response.ok) throw new Error('Proveedor no disponible');
      const result = (await response.json()) as { data?: unknown };
      const transaction = transactionData(result.data);
      if (transaction.id !== id) throw new Error('Identidad incompatible');
      return transaction;
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo verificar la transacción con Wompi Sandbox; intenta nuevamente',
      );
    }
  }
}
