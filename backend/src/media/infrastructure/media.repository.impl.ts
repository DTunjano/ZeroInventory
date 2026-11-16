import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MediaOrmEntity } from './media.orm-entity'
import { MediaRepository, MediaFilters, PaginatedMediaResult } from '../domain/media.repository'
import { Media, MediaTipo, MediaEstado } from '../domain/media.models'

@Injectable()
export class MediaRepositoryImpl implements MediaRepository {
  constructor(
    @InjectRepository(MediaOrmEntity)
    private readonly repo: Repository<MediaOrmEntity>,
  ) {}

  async findAll(filters?: MediaFilters): Promise<PaginatedMediaResult> {
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 10
    const skip = (page - 1) * limit

    const qb = this.repo.createQueryBuilder('media')

    // Filtrar por tipo
    if (filters?.tipo) {
      qb.andWhere('media.tipo = :tipo', { tipo: filters.tipo })
    }

    // Filtrar por estado
    if (filters?.estado) {
      qb.andWhere('media.estado = :estado', { estado: filters.estado })
    }

    // Buscar por título
    if (filters?.search) {
      qb.andWhere('LOWER(media.titulo) ILIKE LOWER(:search)', {
        search: `%${filters.search}%`,
      })
    }

    // Ordenar por orden (prioridad visual) y luego por fecha creación (DESC)
    const [data, total] = await qb
      .orderBy('media.orden', 'ASC')
      .addOrderBy('media.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: data.map((entity) => this.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: number): Promise<Media | null> {
    const entity = await this.repo.findOne({ where: { mediaId: id } })
    return entity ? this.toDomain(entity) : null
  }

  async findByTipo(tipo: MediaTipo): Promise<Media[]> {
    const entities = await this.repo.find({
      where: { tipo, estado: 'activo' },
      order: { orden: 'ASC', createdAt: 'DESC' },
    })
    return entities.map((entity) => this.toDomain(entity))
  }

  async save(media: Media): Promise<Media> {
    const entity = this.repo.create({
      tipo: media.tipo,
      titulo: media.titulo,
      descripcion: media.descripcion,
      url: media.url,
      publicId: media.publicId,
      estado: media.estado,
      orden: media.orden,
    })
    const saved = await this.repo.save(entity)
    return this.toDomain(saved)
  }

  async update(id: number, media: Partial<Media>): Promise<Media> {
    const updateData: Partial<MediaOrmEntity> = {}

    if (media.titulo !== undefined) updateData.titulo = media.titulo
    if (media.descripcion !== undefined) updateData.descripcion = media.descripcion
    if (media.url !== undefined) updateData.url = media.url
    if (media.publicId !== undefined) updateData.publicId = media.publicId
    if (media.tipo !== undefined) updateData.tipo = media.tipo
    if (media.estado !== undefined) updateData.estado = media.estado
    if (media.orden !== undefined) updateData.orden = media.orden

    await this.repo.update(id, updateData)
    const updated = await this.repo.findOneOrFail({ where: { mediaId: id } })
    return this.toDomain(updated)
  }

  async delete(id: number): Promise<void> {
    // Soft delete: marcar como inactivo
    await this.repo.update(id, { estado: 'inactivo' })
  }

  async toggleEstado(id: number): Promise<Media> {
    const media = await this.repo.findOneOrFail({ where: { mediaId: id } })
    const newEstado: MediaEstado = media.estado === 'activo' ? 'inactivo' : 'activo'
    await this.repo.update(id, { estado: newEstado })
    const updated = await this.repo.findOneOrFail({ where: { mediaId: id } })
    return this.toDomain(updated)
  }

  /**
   * Mapear ORM entity a domain model
   */
  private toDomain(entity: MediaOrmEntity): Media {
    return new Media(
      entity.mediaId,
      entity.titulo,
      entity.descripcion ?? null,
      entity.url,
      entity.publicId,
      entity.tipo,
      entity.estado,
      entity.orden,
      entity.createdAt,
      entity.updatedAt,
    )
  }
}
