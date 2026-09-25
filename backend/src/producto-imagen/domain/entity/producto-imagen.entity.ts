export class ProductoImagen {
  readonly imagenProductoId: number = 0;
  productoId: number = 0;
  url: string = '';
  publicId: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    imagenProductoId: number,
    productoId: number,
    url: string,
    publicId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.imagenProductoId = imagenProductoId;
    this.productoId = productoId;
    this.url = url;
    this.publicId = publicId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
