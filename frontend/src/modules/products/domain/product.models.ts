export interface Category {
  categoriaId: number
  nombre: string
  descripcion?: string
  isActive?: boolean
}

export interface Product {
  productoId: number
  proveedorId: number | null
  nombre: string
  cantidad: number
  precio: number
  descripcion: string | null
  sku: string
  marca: string | null
  material: string | null
  peso: string | null
  medida: string | null
  isActive: boolean
  categoria?: Category
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  imagenProductoId: number
  productoId: number
  url: string
  publicId: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductFilters {
  sku?: string
  nombre?: string
  marca?: string
  precioMin?: number
  precioMax?: number
  page?: number
  limit?: number
}

export interface CreateProductInput {
  nombre: string
  proveedorId?: number | null
  cantidad: number
  precio: number
  descripcion?: string | null
  marca?: string | null
  material?: string | null
  peso?: string | null
  medida?: string | null
}

export interface UpdateProductInput {
  nombre?: string
  proveedorId?: number | null
  cantidad?: number
  precio?: number
  descripcion?: string | null
  sku?: string
  marca?: string | null
  material?: string | null
  peso?: string | null
  medida?: string | null
  isActive?: boolean
}
