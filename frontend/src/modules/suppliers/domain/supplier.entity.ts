export interface Direccion {
  direccionId: number
  lineaDir: string
  barrio: string
  codigoPostal: string | null
  infoAdiccional: string | null
}

export interface Proveedor {
  proveedorId: number
  nombre: string
  nombreTitular: string | null
  telefono: string | null
  email: string | null
  isActive: boolean
  direcciones: Direccion[]
  productosSuministrados?: number
}

export enum ProveedorEstado {
  activo = 'ACTIVO',
  inactivo = 'INACTIVO',
}
