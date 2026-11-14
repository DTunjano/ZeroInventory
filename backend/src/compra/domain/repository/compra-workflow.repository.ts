import {
  CompraDetalle,
  CompraDraft,
  CompraFiltros,
  CompraPagina,
} from '../compra-workflow.types';

export abstract class CompraWorkflowRepository {
  abstract createDraft(
    data: CompraDraft,
    actorId: number,
  ): Promise<CompraDetalle>;
  abstract updateDraft(
    id: number,
    version: number,
    data: CompraDraft,
    actorId: number,
  ): Promise<CompraDetalle>;
  abstract receive(
    id: number,
    version: number,
    actorId: number,
  ): Promise<CompraDetalle>;
  abstract cancel(
    id: number,
    version: number,
    motivo: string,
    actorId: number,
  ): Promise<CompraDetalle>;
  abstract get(id: number): Promise<CompraDetalle>;
  abstract list(filters: CompraFiltros): Promise<CompraPagina>;
}
