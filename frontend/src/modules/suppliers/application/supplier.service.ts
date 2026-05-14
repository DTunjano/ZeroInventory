import { http } from '@/infrastructure/http/http';
import type { Proveedor } from '../domain/supplier.entity';

export interface CreateProveedorPayload {
  nombre: string
  nombreTitular?: string | null
  telefono?: string | null
  email?: string | null
  direcciones?: Partial<Omit<Direccion, 'direccionId'>>[]
}

export interface UpdateProveedorPayload {
  nombre?: string
  nombreTitular?: string | null
  telefono?: string | null
  email?: string | null
  isActive?: boolean
  direcciones?: Partial<Omit<Direccion, 'direccionId'>>[]
}

export interface FiltersProveedorDTO {
  nombre?: string
  email?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface PaginatedProveedores {
  data: Proveedor[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Direccion {
  direccionId: number
  lineaDir: string
  barrio: string
  codigoPostal: string | null
  infoAdiccional: string | null
}

class SupplierService {
  async getAll(filters: FiltersProveedorDTO = {}): Promise<PaginatedProveedores> {
    const params = new URLSearchParams()
    if (filters.nombre) params.append('nombre', filters.nombre)
    if (filters.email) params.append('email', filters.email)
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))

    const url = `/proveedores${params.toString() ? `?${params.toString()}` : ''}`
    const { data } = await http.get<PaginatedProveedores>(url)
    return data
  }

  async getById(proveedorId: number): Promise<Proveedor> {
    const { data } = await http.get<Proveedor>(`/proveedores/${proveedorId}`)
    return data
  }

  async create(payload: CreateProveedorPayload): Promise<Proveedor> {
    const { data } = await http.post<Proveedor>('/proveedores', payload)
    return data
  }

  async update(proveedorId: number, payload: UpdateProveedorPayload): Promise<Proveedor> {
    const { data } = await http.put<Proveedor>(`/proveedores/${proveedorId}`, payload)
    return data
  }

  async toggleStatus(proveedorId: number): Promise<Proveedor> {
    const { data } = await http.patch<Proveedor>(`/proveedores/${proveedorId}/estado`)
    return data
  }

  async getSuppliedProductCount(proveedorId: number): Promise<number> {
    const { data } = await http.get<{ total: number }>(`/proveedores/${proveedorId}/productos-suministrados`)
    return data.total
  }
}

export const supplierService = new SupplierService()
