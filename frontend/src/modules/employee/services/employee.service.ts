import { http } from '@/infrastructure/http/http'

export interface Empleado {
  empleadoId: number
  nombre: string
  email: string
  estado: 'ACTIVO' | 'INACTIVO'
  usuarioId: number | null
  telefono: string | null
  documento: string | null
  roles: string[]
  nombreCompleto: string
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedEmpleados {
  data: Empleado[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateEmployeePayload {
  nombre: string
  email: string
  password: string
  documento?: string | null
  telefono?: string | null
}

export interface UpdateEmployeePayload {
  nombre?: string
  email?: string
  password?: string
  documento?: string | null
  telefono?: string | null
}

export const employeeService = {
  async listEmployees(params: {
    page?: number
    limit?: number
    estado?: string
    nombre?: string
    email?: string
  } = {}): Promise<PaginatedEmpleados> {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', String(params.page))
    if (params.limit) searchParams.append('limit', String(params.limit))
    if (params.estado) searchParams.append('estado', params.estado)
    if (params.nombre) searchParams.append('nombre', params.nombre)
    if (params.email) searchParams.append('email', params.email)

    const url = `/empleados${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const { data } = await http.get<PaginatedEmpleados>(url)
    return data
  },

  async createEmployee(payload: CreateEmployeePayload): Promise<Empleado> {
    const { data } = await http.post<Empleado>('/empleados', payload)
    return data
  },

  async updateEmployee(
    empleadoId: number,
    payload: UpdateEmployeePayload,
  ): Promise<Empleado> {
    const { data } = await http.put<Empleado>(`/empleados/${empleadoId}`, payload)
    return data
  },

  async deactivateEmployee(empleadoId: number): Promise<Empleado> {
    const { data } = await http.delete<Empleado>(`/empleados/${empleadoId}`)
    return data
  },
}
