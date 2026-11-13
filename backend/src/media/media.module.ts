import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

import { MediaOrmEntity } from './infrastructure/media.orm-entity'
import { MediaRepositoryImpl } from './infrastructure/media.repository.impl'
import { MediaRepository } from './domain/media.repository'
import { MediaCloudinaryService } from './infrastructure/cloudinary/media-cloudinary.service'

import { MediaController } from './interfaces/media.controller'
import { CreateMediaUseCase } from './application/create-media.usecase'
import { UpdateMediaUseCase } from './application/update-media.usecase'
import { DeleteMediaUseCase } from './application/delete-media.usecase'
import { GetMediaUseCase, ListMediaUseCase } from './application/get-media.usecase'
import { ToggleActiveMediaUseCase } from './application/toggle-active-media.usecase'
import { TogglePrincipalMediaUseCase } from './application/toggle-principal-media.usecase'

import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module'

/**
 * Media Module
 * Gestión de videos promocionales y media
 *
 * Providers:
 * - Use Cases: CRUD operations
 * - Repository: Data access abstraction
 * - Cloudinary Service: File upload integration
 *
 * Features:
 * - Video upload to Cloudinary
 * - Metadata management (title, description, order)
 * - Soft delete (mark as inactive)
 * - Role-based access control (admin only)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MediaOrmEntity]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB
      },
    }),
    CloudinaryModule,
  ],
  controllers: [MediaController],
  providers: [
    // Use Cases
    CreateMediaUseCase,
    UpdateMediaUseCase,
    DeleteMediaUseCase,
    GetMediaUseCase,
    ListMediaUseCase,
    ToggleActiveMediaUseCase,
    TogglePrincipalMediaUseCase, // DEPRECATED

    // Services
    MediaCloudinaryService,

    // Repository
    {
      provide: MediaRepository,
      useClass: MediaRepositoryImpl,
    },
  ],
  exports: [MediaRepository],
})
export class MediaModule {}

