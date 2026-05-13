import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductoRepository } from '../../domain/repository/producto.repository';
import { Producto } from '../../domain/entity/producto.entity';
import { ProveedorRepository } from '../../../proveedor/domain/repository/proveedor.repository';
import { RegisterStockAdjustmentUseCase } from '../../../inventory/application/use-cases/register-stock-adjustment.use-case';
import { RegisterStockEntryUseCase } from '../../../inventory/application/use-cases/register-stock-entry.use-case';
import { TipoReferenciaEnum } from '../../../entities/kardex.orm-entity';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productoRepo: ProductoRepository,
    private readonly proveedorRepo: ProveedorRepository,
    private readonly registerStockAdjustmentUseCase: RegisterStockAdjustmentUseCase,
    private readonly registerStockEntryUseCase: RegisterStockEntryUseCase,
  ) {}

  async ejecutar(
    productoId: number,
    usuarioId: number,
    cambios: {
      proveedorId?: number | null;
      nombre?: string;
      sku?: string;
      cantidad?: number;
      precio?: number;
      descripcion?: string | null;
      marca?: string | null;
      material?: string | null;
      peso?: string | null;
      medida?: string | null;
      isActive?: boolean;
    },
  ): Promise<Producto> {
    const actual = await this.productoRepo.getById(productoId);
    if (!actual) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (cambios.proveedorId !== undefined && cambios.proveedorId !== null) {
      const proveedor = await this.proveedorRepo.getById(cambios.proveedorId);
      if (!proveedor) {
        throw new ConflictException('Proveedor no encontrado');
      }
    }

    const nombre = cambios.nombre ?? actual.nombre;

    if (await this.productoRepo.existsByNombre(nombre, productoId)) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    const sku = cambios.sku ?? actual.sku;
    if (await this.productoRepo.existsBySku(sku, productoId)) {
      throw new ConflictException('Ya existe un producto con ese SKU');
    }

    const producto = new Producto(
      actual.productoId,
      cambios.proveedorId !== undefined ? cambios.proveedorId : actual.proveedorId,
      cambios.nombre ?? actual.nombre,
      cambios.cantidad ?? actual.cantidad,
      cambios.precio ?? actual.precio,
      cambios.descripcion !== undefined ? cambios.descripcion : actual.descripcion,
      sku,
      cambios.marca !== undefined ? cambios.marca : actual.marca,
      cambios.material !== undefined ? cambios.material : actual.material,
      cambios.peso !== undefined ? cambios.peso : actual.peso,
      cambios.medida !== undefined ? cambios.medida : actual.medida,
      cambios.isActive !== undefined ? cambios.isActive : actual.isActive,
      actual.createdAt,
      new Date(),
    );

    const actualizado = await this.productoRepo.update(producto);

    // Registrar ajuste si cambió la cantidad
    if (cambios.cantidad !== undefined && cambios.cantidad !== actual.cantidad) {
      try {
        if (cambios.cantidad > actual.cantidad) {
          await this.registerStockEntryUseCase.ejecutar({
            productoId,
            cantidad: cambios.cantidad - actual.cantidad,
            costoUnitario: actualizado.precio,
            referenciaId: productoId,
            tipoReferencia: TipoReferenciaEnum.AJUSTE,
          });
        }

        await this.registerStockAdjustmentUseCase.ejecutar(usuarioId, {
          productoId,
          stockAnterior: actual.cantidad,
          stockNuevo: cambios.cantidad,
          motivo: 'Ajuste manual de inventario desde gestión de productos',
        });
      } catch (error) {
        console.error('No se pudo registrar el ajuste automático de inventario', error)
      }
    }

    return actualizado;
  }
}
