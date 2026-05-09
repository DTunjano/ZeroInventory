export class Categoria {
  readonly categoriaId: number = 0;
  nombre: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    categoriaId: number,
    nombre: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.categoriaId = categoriaId;
    this.nombre = nombre;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
