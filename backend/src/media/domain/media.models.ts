/**
 * Domain: Media Entity
 * Modelo de dominio para Media (Video Promocional)
 */

export type MediaTipo = 'video' | 'image';
export type MediaEstado = 'activo' | 'inactivo';

export class Media {
  readonly mediaId: number;
  titulo: string;
  descripcion: string | null;
  url: string; // Cloudinary secure_url
  publicId: string; // Para eliminación en Cloudinary
  tipo: MediaTipo;
  estado: MediaEstado; // 'activo' | 'inactivo'
  orden: number; // Prioridad visual (0-100)
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(
    mediaId: number,
    titulo: string,
    descripcion: string | null,
    url: string,
    publicId: string,
    tipo: MediaTipo,
    estado: MediaEstado,
    orden: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.mediaId = mediaId;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.url = url;
    this.publicId = publicId;
    this.tipo = tipo;
    this.estado = estado;
    this.orden = orden;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Cambiar estado del media entre activo/inactivo
   */
  toggleEstado(): void {
    this.estado = this.estado === 'activo' ? 'inactivo' : 'activo';
  }

  /**
   * Marcar como activo
   */
  marcarActivo(): void {
    this.estado = 'activo';
  }

  /**
   * Marcar como inactivo (soft delete)
   */
  marcarInactivo(): void {
    this.estado = 'inactivo';
  }

  /**
   * Validar que el media es público (activo)
   */
  esPublico(): boolean {
    return this.estado === 'activo';
  }
}
