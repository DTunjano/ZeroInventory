import type {
  OwnPedidoFilters,
  PedidoAction,
  PedidoActor,
  PedidoCommand,
  PedidoFilters,
  PedidoPage,
  PedidoView,
} from '../pedido-workflow.types';
export abstract class PedidoWorkflowRepository {
  abstract get(id: number, customerUserId?: number): Promise<PedidoView>;
  abstract list(filters: PedidoFilters): Promise<PedidoPage>;
  abstract listOwn(
    clienteId: number,
    filters: OwnPedidoFilters,
  ): Promise<PedidoView[]>;
  abstract execute(
    id: number,
    action: PedidoAction,
    command: PedidoCommand,
    actor: PedidoActor,
  ): Promise<PedidoView>;
}
