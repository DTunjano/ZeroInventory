import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'

import { JwtAuthGuard } from '../../auth/adapters/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/adapters/guards/roles.guard'
import { Roles } from '../../auth/adapters/decorators/roles.decorator'
import { RolNombreEnum } from '../../rol/domain/entity/rol.entity'
import { Public } from '../../auth/adapters/decorators/public.decorator'

import { CreateMediaUseCase } from '../application/create-media.usecase'
import { UpdateMediaUseCase } from '../application/update-media.usecase'
import { DeleteMediaUseCase } from '../application/delete-media.usecase'
import { GetMediaUseCase, ListMediaUseCase } from '../application/get-media.usecase'
import { ToggleActiveMediaUseCase } from '../application/toggle-active-media.usecase'

import { CreateMediaDto } from '../application/dto/create-media.dto'
import { UpdateMediaDto } from '../application/dto/update-media.dto'
import { QueryMediaDto } from '../application/dto/query-media.dto'
import { MediaResponseDto, PaginatedMediaResponseDto } from '../application/dto/media-response.dto'

/**
 * Controller: Media (Video Promocional)
 * Gestión de videos y media promocionales
 *
 * Permisos:
 * - Admin: CRUD completo
 * - Employee: Lectura
 * - Customer/Público: Visualización (solo activos)
 */
@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(
    private readonly createMedia: CreateMediaUseCase,
    private readonly updateMedia: UpdateMediaUseCase,
    private readonly deleteMedia: DeleteMediaUseCase,
    private readonly getMedia: GetMediaUseCase,
    private readonly listMedia: ListMediaUseCase,
    private readonly toggleActive: ToggleActiveMediaUseCase,
  ) {}

  /**
   * GET /media
   * Listar todos los media con filtros (público - solo activos)
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar media activos (público)' })
  async list(@Query() query: QueryMediaDto): Promise<PaginatedMediaResponseDto> {
    const result = await this.listMedia.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
      tipo: query.tipo,
      estado: 'activo', // Solo activos para público
    })
    return PaginatedMediaResponseDto.fromResult(result)
  }

  /**
   * GET /media/admin/all
   * Listar TODOS los media (incluyendo inactivos) - solo para admin
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN)
  @ApiOperation({ summary: 'Listar todos los media (admin)' })
  async listAll(@Query() query: QueryMediaDto): Promise<PaginatedMediaResponseDto> {
    const result = await this.listMedia.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
      tipo: query.tipo,
      estado: query.estado, // Admin puede ver activos e inactivos
    })
    return PaginatedMediaResponseDto.fromResult(result)
  }

  /**
   * GET /media/:id
   * Obtener un media por ID (público)
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener media por ID (público)' })
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<MediaResponseDto> {
    const media = await this.getMedia.execute(id)
    if (media.estado !== 'activo') throw new NotFoundException('Media no encontrado')
    return MediaResponseDto.fromEntity(media)
  }

  /**
   * POST /media
   * Crear nuevo media (solo admin)
   * Multipart form-data: file + titulo + descripcion
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Crear nuevo media (admin)' })
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaResponseDto> {
    if (!file) {
      throw new BadRequestException('El archivo de video es requerido')
    }

    const media = await this.createMedia.execute(dto, file)
    return MediaResponseDto.fromEntity(media)
  }

  /**
   * PATCH /media/:id
   * Actualizar media (solo admin)
   * Puede actualizar: titulo, descripcion
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Actualizar media (admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<MediaResponseDto> {
    const media = await this.updateMedia.execute(id, dto, file)
    return MediaResponseDto.fromEntity(media)
  }

  /**
   * DELETE /media/:id
   * Eliminar media (soft delete - marcar como inactivo)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN)
  @ApiOperation({ summary: 'Eliminar media (admin)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteMedia.execute(id)
  }

  /**
   * PATCH /media/:id/toggle-status
   * Cambiar estado del media (activo <-> inactivo)
   */
  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.ADMIN)
  @ApiOperation({ summary: 'Cambiar estado del media (admin)' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number): Promise<MediaResponseDto> {
    const media = await this.toggleActive.execute(id)
    return MediaResponseDto.fromEntity(media)
  }
}
