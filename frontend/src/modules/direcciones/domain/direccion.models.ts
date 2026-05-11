export interface DireccionView {
  direccionId: number
  clienteId: number
  lineaDir: string
  barrio: string
  codigoPostal: string | null
  infoAdiccional: string | null
}

export interface CreateDireccionInput {
  lineaDir: string
  barrio: string
  codigoPostal?: string | null
  infoAdiccional?: string | null
}