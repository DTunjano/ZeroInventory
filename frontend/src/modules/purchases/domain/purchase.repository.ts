import type {
  CompraDetalle,
  CompraDraftInput,
  CompraFiltros,
  CompraPagina,
} from './purchase.models'
export interface PurchaseRepository {
  list(filters: CompraFiltros): Promise<CompraPagina>
  get(id: number): Promise<CompraDetalle>
  create(input: CompraDraftInput): Promise<CompraDetalle>
  update(
    id: number,
    version: number,
    input: CompraDraftInput,
  ): Promise<CompraDetalle>
  receive(id: number, version: number): Promise<CompraDetalle>
  cancel(id: number, version: number, motivo: string): Promise<CompraDetalle>
}
