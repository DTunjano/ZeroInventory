export class CategoriaProducto {
  readonly categoriaProductoId: number = 0;
  categoriaId: number = 0;
  productoId: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    categoriaProductoId: number,
    categoriaId: number,
    productoId: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.categoriaProductoId = categoriaProductoId;
    this.categoriaId = categoriaId;
    this.productoId = productoId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
