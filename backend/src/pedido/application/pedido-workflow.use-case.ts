import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PedidoWorkflowRepository } from '../domain/repository/pedido-workflow.repository';
import {
  PEDIDO_ACTIONS,
  PedidoCommand,
  PedidoAction,
  PedidoFilters,
  OwnPedidoFilters,
} from '../domain/pedido-workflow.types';
import { ClienteRepository } from '../../cliente/domain/repository/cliente.repository';
@Injectable()
export class PedidoWorkflowUseCase {
  constructor(
    private readonly repository: PedidoWorkflowRepository,
    private readonly clients: ClienteRepository,
  ) {}
  get(id: number, customerUserId?: number) {
    return this.repository.get(id, customerUserId);
  }
  list(filters: PedidoFilters) {
    return this.repository.list(filters);
  }
  async own(usuarioId: number, filters: OwnPedidoFilters) {
    const client = await this.clients.getByUsuarioId(usuarioId);
    return client ? this.repository.listOwn(client.clienteId, filters) : [];
  }
  execute(
    id: number,
    action: string,
    command: PedidoCommand,
    usuarioId: number,
    roles: readonly string[],
    customerOnly = false,
  ) {
    if (!PEDIDO_ACTIONS.includes(action as PedidoAction))
      throw new BadRequestException('Operación de pedido inválida');
    if (!command.motivo.trim())
      throw new BadRequestException('El motivo es obligatorio');
    if (
      customerOnly
        ? action !== 'CANCELAR' || !roles.includes('CUSTOMER')
        : !roles.includes('ADMIN') &&
          (!roles.includes('EMPLOYEE') ||
            !['ENVIAR', 'ENTREGAR'].includes(action))
    )
      throw new ForbiddenException('No tienes permiso para esta operación');
    return this.repository.execute(
      id,
      action as PedidoAction,
      { ...command, motivo: command.motivo.trim() },
      { usuarioId, customerOnly },
    );
  }
}
