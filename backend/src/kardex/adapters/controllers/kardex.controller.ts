import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateKardexUseCase } from '../../application/use-cases/create-kardex.use-case';
import { GetAllKardexUseCase } from '../../application/use-cases/get-all-kardex.use-case';
import { GetKardexByIdUseCase } from '../../application/use-cases/get-kardex-by-id.use-case';
import { UpdateKardexUseCase } from '../../application/use-cases/update-kardex.use-case';
import { DeleteKardexUseCase } from '../../application/use-cases/delete-kardex.use-case';
import { CreateKardexSwagger } from '../documentation/create-kardex.swagger';
import { GetAllKardexSwagger } from '../documentation/get-all-kardex.swagger';
import { GetKardexByIdSwagger } from '../documentation/get-kardex-by-id.swagger';
import { UpdateKardexSwagger } from '../documentation/update-kardex.swagger';
import { UpdateKardexDTO } from '../../application/dto/update-kardex-dto';
import { DeleteKardexSwagger } from '../documentation/delete-kardex.swagger';
import { FilterKardexDTO } from '../../application/dto/filters-kardex-dto';
import { CreateKardexDTO } from '../../application/dto/create-kardex-dto';
import { Kardex } from '../../domain/entity/kardex.entity';

@ApiTags('Kardex')
@Controller('kardex')
export class KardexController {
  constructor(
    private readonly createKardexUseCase: CreateKardexUseCase,
    private readonly getAllKardexUseCase: GetAllKardexUseCase,
    private readonly getKardexByIdUseCase: GetKardexByIdUseCase,
    private readonly updateKardexUseCase: UpdateKardexUseCase,
    private readonly deleteKardexUseCase: DeleteKardexUseCase,
  ) {}

  @Post()
  @CreateKardexSwagger()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createKardexDTO: CreateKardexDTO): Promise<Kardex> {
    return await this.createKardexUseCase.execute(createKardexDTO);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @GetAllKardexSwagger()
  async getAll(@Query() filterKardexDTO: FilterKardexDTO): Promise<{
    data: Kardex[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.getAllKardexUseCase.execute(filterKardexDTO);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @GetKardexByIdSwagger()
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Kardex> {
    const kardex = await this.getKardexByIdUseCase.execute(id);
    if (!kardex) {
      throw new NotFoundException('Kardex not found');
    }
    return kardex;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UpdateKardexSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKardexDTO: UpdateKardexDTO,
  ) {
    try {
      return await this.updateKardexUseCase.execute(id, updateKardexDTO);
    } catch {
      throw new NotFoundException('Pago no encontrado');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @DeleteKardexSwagger()
  async delete(@Param('id') id: number) {
    return await this.deleteKardexUseCase.execute(id);
  }
}
