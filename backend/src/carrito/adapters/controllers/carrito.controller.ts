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
import { CurrentUser } from '../../../auth/adapters/decorators/current-user.decorator';
import { AddItemToCartDTO } from '../../application/dto/add-item-to-cart.dto';
import { CheckoutCartDTO } from '../../application/dto/checkout-cart.dto';
import { UpdateCartItemQuantityDTO } from '../../application/dto/update-cart-item-quantity.dto';
import { AddItemToCartUseCase } from '../../application/use-cases/add-item-to-cart.use-case';
import {
  GetOpenCartByUsuarioUseCase,
  OpenCartView,
} from '../../application/use-cases/get-open-cart-by-usuario.use-case';
import { CheckoutCartUseCase } from '../../application/use-cases/checkout-cart.use-case';
import { UpdateCartItemQuantityUseCase } from '../../application/use-cases/update-cart-item-quantity.use-case';
import { RemoveProductFromCartUseCase } from '../../application/use-cases/remove-product-from-cart.use-case';
import { ClearCartUseCase } from '../../application/use-cases/clear-cart.use-case';

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
    private readonly updateCartItemQuantityUseCase: UpdateCartItemQuantityUseCase,
    private readonly removeProductFromCartUseCase: RemoveProductFromCartUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyOpenCart(@CurrentUser() usuarioId: number): Promise<OpenCartView> {
    return this.getOpenCartByUsuarioUseCase.ejecutar(usuarioId);
  }

  @Post('me/items')
  @UseGuards(JwtAuthGuard)
  async addItem(
    @CurrentUser() usuarioId: number,
    @Body() body: AddItemToCartDTO,
  ): Promise<OpenCartView> {
    return this.addItemToCartUseCase.ejecutar({
      usuarioId,
      productoId: body.productoId,
      cantidad: body.cantidad,
    });
  }

  @Post('me/checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @CurrentUser() usuarioId: number,
    @Body() body: CheckoutCartDTO,
  ): Promise<{ pedidoId: number; total: number; numeroPedidoUsuario: number }> {
    return this.checkoutCartUseCase.ejecutar({
      usuarioId,
      direccionId: body.direccionId,
      metodoPago: body.metodoPago,
    });
  }

  @Put('me/items/:carritoDetalleId')
  @UseGuards(JwtAuthGuard)
  async updateItemQuantity(
    @CurrentUser() usuarioId: number,
    @Param('carritoDetalleId', ParseIntPipe) carritoDetalleId: number,
    @Body() body: UpdateCartItemQuantityDTO,
  ): Promise<OpenCartView> {
    return this.updateCartItemQuantityUseCase.ejecutar({
      usuarioId,
      carritoDetalleId,
      cantidad: body.cantidad,
    });
  }

  @Delete('me/items/:carritoDetalleId')
  @UseGuards(JwtAuthGuard)
  async removeItem(
    @CurrentUser() usuarioId: number,
    @Param('carritoDetalleId', ParseIntPipe) carritoDetalleId: number,
  ): Promise<OpenCartView> {
    return this.removeProductFromCartUseCase.ejecutar({
      usuarioId,
      carritoDetalleId,
    });
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async clearCart(@CurrentUser() usuarioId: number): Promise<OpenCartView> {
    return this.clearCartUseCase.ejecutar(usuarioId);
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
