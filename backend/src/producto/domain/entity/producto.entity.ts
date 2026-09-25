export class Producto {
  readonly productoId: number = 0;
  nombre: string = '';
  cantidad: number = 0;
  precio: number = 0;
  descripcion: string | null = null;
  sku: string = '';
  marca: string | null = null;
  material: string | null = null;
  peso: string | null = null;
  medida: string | null = null;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    productoId: number,
    nombre: string,
    cantidad: number,
    precio: number,
    descripcion: string | null,
    sku: string,
    marca: string | null,
    material: string | null,
    peso: string | null,
    medida: string | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.productoId = productoId;
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precio = precio;
    this.descripcion = descripcion;
    this.sku = sku;
    this.marca = marca;
    this.material = material;
    this.peso = peso;
    this.medida = medida;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
