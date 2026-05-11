import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCarritoUseCase } from '../../application/use-cases/create-carrito.use-case';
import { Carrito } from '../../domain/entity/carrito.entity';
import { CreateCarritoDTO } from '../../application/dto/create-carrito-dto';
import { GetCarritoByIdUseCase } from '../../application/use-cases/get-carrito-by-id.use-case';
import { GetAllCarritosUseCase } from '../../application/use-cases/get-all-carrito.use-case';
import { FiltersCarritoDTO } from '../../application/dto/filters-carrito-dto';
import { UpdateCarritoUseCase } from '../../application/use-cases/update-carrito.use-case';
import { DeleteCarritoUseCase } from '../../application/use-cases/delete-carrito.use-case';
import { UpdateCarritoDTO } from '../../application/dto/update-carrito-dto';
import { CreateCarritoSwagger } from '../documentation/create-carrito.swagger';
import { GetAllCarritosSwagger } from '../documentation/get-all-carrito.swagger';
import { UpdateCarritoSwagger } from '../documentation/update-carrito.swagger';
import { DeleteCarritoSwagger } from '../documentation/delete-carrito.swagger';
import { GetCarritoByIdSwagger } from '../documentation/get-carrito-by-id.swagger';
import { JwtAuthGuard } from '../../../auth/adapters/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/adapters/guards/roles.guard';
import { Roles } from '../../../auth/adapters/decorators/roles.decorator';
import { RolNombreEnum } from '../../../rol/domain/entity/rol.entity';
import { JwtAccessPayload } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { AddItemToCartDTO } from '../../application/dto/add-item-to-cart.dto';
import { CheckoutCartDTO } from '../../application/dto/checkout-cart.dto';
import { AddItemToCartUseCase } from '../../application/use-cases/add-item-to-cart.use-case';
import {
  GetOpenCartByUsuarioUseCase,
  OpenCartView,
} from '../../application/use-cases/get-open-cart-by-usuario.use-case';
import { CheckoutCartUseCase } from '../../application/use-cases/checkout-cart.use-case';

@ApiTags('Carritos')
@Controller('carritos')
export class CarritoController {
  constructor(
    private readonly createCarritoUseCase: CreateCarritoUseCase,
    private readonly getCarritoByIdUseCase: GetCarritoByIdUseCase,
    private readonly getAllCarritosUseCase: GetAllCarritosUseCase,
    private readonly updateCarritoUseCase: UpdateCarritoUseCase,
    private readonly deleteCarritoUseCase: DeleteCarritoUseCase,
    private readonly getOpenCartByUsuarioUseCase: GetOpenCartByUsuarioUseCase,
    private readonly addItemToCartUseCase: AddItemToCartUseCase,
    private readonly checkoutCartUseCase: CheckoutCartUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.CUSTOMER)
  async getMyOpenCart(@Req() req: { user: JwtAccessPayload }): Promise<OpenCartView> {
    return this.getOpenCartByUsuarioUseCase.ejecutar(req.user.sub);
  }

  @Post('me/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.CUSTOMER)
  async addItem(
    @Req() req: { user: JwtAccessPayload },
    @Body() body: AddItemToCartDTO,
  ): Promise<OpenCartView> {
    return this.addItemToCartUseCase.ejecutar({
      usuarioId: req.user.sub,
      productoId: body.productoId,
      cantidad: body.cantidad,
    });
  }

  @Post('me/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolNombreEnum.CUSTOMER)
  async checkout(
    @Req() req: { user: JwtAccessPayload },
    @Body() body: CheckoutCartDTO,
  ): Promise<{ pedidoId: number; total: number }> {
    return this.checkoutCartUseCase.ejecutar({
      usuarioId: req.user.sub,
      direccionId: body.direccionId,
      metodoPago: body.metodoPago,
    });
  }

  @Post()
  @CreateCarritoSwagger()
  async create(@Body() body: CreateCarritoDTO): Promise<Carrito> {
    const carrito = await this.createCarritoUseCase.ejecutar(body);
    if (!carrito) {
      throw new NotFoundException('No se pudo crear el carrito');
    }
    return carrito;
  }

  @Get()
  @GetAllCarritosSwagger()
  async getAll(@Query() filters?: FiltersCarritoDTO): Promise<{
    data: Carrito[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getAllCarritosUseCase.ejecutar(filters);
  }

  @Get(':id')
  @GetCarritoByIdSwagger()
  async getById(
    @Param('id', ParseIntPipe) carritoId: number,
  ): Promise<Carrito> {
    const carrito = await this.getCarritoByIdUseCase.ejecutar(carritoId);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }
    return carrito;
  }

  @Put(':id')
  @UpdateCarritoSwagger()
  async update(
    @Param('id', ParseIntPipe) carritoId: number,
    @Body() body: UpdateCarritoDTO,
  ): Promise<Carrito> {
    const carrito = await this.updateCarritoUseCase.ejecutar(carritoId, body);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }
    return carrito;
  }

  @Delete(':id')
  @DeleteCarritoSwagger()
  async remove(@Param('id', ParseIntPipe) carritoId: number): Promise<void> {
    return this.deleteCarritoUseCase.ejecutar(carritoId);
  }
}
