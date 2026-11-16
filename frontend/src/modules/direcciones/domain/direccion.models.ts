export interface DireccionView {
  direccionId: number
  clienteId: number
  lineaDir: string
  barrio: string
  codigoPostal: string | null
  infoAdiccional: string | null
  esPredeterminada: boolean
}

export interface CreateDireccionInput {
  lineaDir: string
  barrio: string
  codigoPostal?: string | null
  infoAdiccional?: string | null
  esPredeterminada?: boolean
}
