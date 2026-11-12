import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service'
import type { UploadApiOptions } from 'cloudinary'

/**
 * Servicio para manejar uploads de media a Cloudinary
 * Responsable de: validar, subir y procesar archivos
 */
@Injectable()
export class MediaCloudinaryService {
  private readonly CLOUDINARY_FOLDER = 'zeroInventoryMedia'
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
  private readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Validar que el archivo sea un video válido
   */
  private validateVideoFile(file: Express.Multer.File): void {
    // Validar tipo MIME
    if (!this.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Se aceptan: ${this.ALLOWED_VIDEO_TYPES.join(', ')}`,
      )
    }

    // Validar tamaño
    if (file.size > this.MAX_VIDEO_SIZE) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Máximo: ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
      )
    }

    // Validar que el buffer no esté vacío
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('El archivo está vacío')
    }
  }

  /**
   * Subir video a Cloudinary
   * Retorna { secure_url, public_id }
   */
  async uploadVideo(file: Express.Multer.File): Promise<{ secure_url: string; public_id: string }> {
    // Validar archivo
    this.validateVideoFile(file)

    try {
      // Configurar opciones para Cloudinary
      const uploadOptions: UploadApiOptions = {
        folder: this.CLOUDINARY_FOLDER,
        resource_type: 'video' as const,
      }

      // Subir a Cloudinary
      const result = await this.cloudinaryService.uploadImage(file, uploadOptions)

      if (!result || !result.secure_url || !result.public_id) {
        throw new InternalServerErrorException('No se pudo procesar la respuesta de Cloudinary')
      }

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      }
    } catch (error) {
      // Si es un BadRequestException que lanzamos nosotros, dejar pasar
      if (error instanceof BadRequestException) {
        throw error
      }

      console.error('❌ Error al subir a Cloudinary:', error)
      throw new InternalServerErrorException('Error al subir el archivo a Cloudinary')
    }
  }

  /**
   * Eliminar video de Cloudinary
   */
  async deleteVideo(publicId: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteImage(publicId)
    } catch (error) {
      console.error('❌ Error al eliminar de Cloudinary:', publicId, error)
      // No lanzar error, solo loguear
      // En producción, podrías querer manejar esto diferente
    }
  }

  /**
   * Eliminar múltiples videos
   */
  async deleteMultipleVideos(publicIds: string[]): Promise<void> {
    try {
      await this.cloudinaryService.deleteMultipleImages(publicIds)
    } catch (error) {
      console.error('❌ Error al eliminar múltiples videos de Cloudinary:', error)
      // No lanzar error, solo loguear
    }
  }
}
