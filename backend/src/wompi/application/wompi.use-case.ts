import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseWompiConfig } from '../../../config/wompi.config';
import { WompiGateway, WompiRepository } from '../domain/wompi.types';
import { integrity, transactionId, verifiedEvent } from './wompi.protocol';

@Injectable()
export class WompiUseCase {
  constructor(
    private readonly config: ConfigService,
    private readonly gateway: WompiGateway,
    private readonly repository: WompiRepository,
  ) {}
  private options() {
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
    return options;
  }
  availability() {
    return {
      enabled: this.config.get('WOMPI_MODE') === 'sandbox',
      environment: 'sandbox',
    };
  }
  async checkout(orderId: number, userId: number) {
    const options = this.options();
    const intent = await this.repository.checkout(orderId, userId);
    const redirect = new URL(options.redirectUrl);
    redirect.searchParams.set('wompiOrder', String(orderId));
    const url = new URL('https://checkout.wompi.co/p/');
    for (const [key, value] of Object.entries({
      'public-key': options.publicKey,
      currency: 'COP',
      'amount-in-cents': String(intent.amountInCents),
      reference: intent.reference,
      'signature:integrity': integrity(
        intent.reference,
        intent.amountInCents,
        options.integritySecret,
      ),
      'redirect-url': redirect.toString(),
    }))
      url.searchParams.set(key, value);
    return { ...intent, environment: 'sandbox', checkoutUrl: url.toString() };
  }
  async reconcile(orderId: number, userId: number, id: string) {
    this.options();
    transactionId(id);
    await this.repository.authorize(orderId, userId);
    const transaction = await this.gateway.transaction(id);
    const reference = await this.repository.findReference(
      transaction.reference,
    );
    if (!reference || reference.pedidoId !== orderId)
      throw new ConflictException('La transacción no pertenece a este pedido');
    return this.repository.apply(transaction, orderId);
  }
  async webhook(body: unknown) {
    const options = this.options();
    const event = verifiedEvent(body, options.eventsSecret);
    const intent = await this.repository.findReference(event.reference);
    if (!intent) return { received: true, ignored: true };
    const transaction = await this.gateway.transaction(event.id);
    if (transaction.reference !== event.reference)
      throw new ConflictException('Referencia incompatible con el evento');
    await this.repository.apply(transaction, intent.pedidoId);
    return { received: true };
  }
}
