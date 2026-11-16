import { BadRequestException } from '@nestjs/common';
import { CreateProductoImagenUseCase } from './create-producto-imagen.use-case';
import { UpdateProductoImagenUseCase } from './update-producto-imagen.use-case';
import { MAX_PRODUCT_IMAGE_BYTES, validateProductImage } from '../validate-product-image';
import { ProductoImagen } from '../../domain/entity/producto-imagen.entity';

describe('Product image preservation and compensation', () => {
  const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), Buffer.alloc(24)]);
  const file = { mimetype: 'image/png', buffer: png, size: png.length } as Express.Multer.File;
  const old = () => new ProductoImagen(1, 2, 'https://example.test/old.png', 'old', new Date(), new Date());
  const repository = { create: jest.fn(), update: jest.fn(), getById: jest.fn() };
  const cloud = { uploadImage: jest.fn(), deleteImage: jest.fn() };
  const products = { getById: jest.fn() };
  beforeEach(() => {
    jest.resetAllMocks();
    repository.getById.mockResolvedValue(old()); products.getById.mockResolvedValue({ productoId: 2 });
    cloud.uploadImage.mockResolvedValue({ secure_url: 'https://example.test/new.png', public_id: 'new' });
    cloud.deleteImage.mockResolvedValue({ result: 'ok' });
  });
  it('rejects empty, mismatched and oversized files before contacting the provider', async () => {
    for (const input of [undefined, { ...file, mimetype: 'text/plain' }, { ...file, buffer: Buffer.from('not a PNG') }, { ...file, buffer: Buffer.alloc(MAX_PRODUCT_IMAGE_BYTES + 1) }]) {
      expect(() => validateProductImage(input)).toThrow(BadRequestException);
    }
    const create = new CreateProductoImagenUseCase(repository as never, cloud as never, products as never);
    await expect(create.ejecutar({ productoId: 2, url: { ...file, mimetype: 'text/plain' } })).rejects.toBeInstanceOf(BadRequestException);
    expect(cloud.uploadImage).not.toHaveBeenCalled();
  });
  it('removes only the newly uploaded resource when creation persistence fails', async () => {
    repository.create.mockRejectedValue(new Error('DB failure'));
    const create = new CreateProductoImagenUseCase(repository as never, cloud as never, products as never);
    await expect(create.ejecutar({ productoId: 2, url: file })).rejects.toThrow('DB failure');
    expect(cloud.deleteImage).toHaveBeenCalledTimes(1); expect(cloud.deleteImage).toHaveBeenCalledWith('new');
  });
  it('preserves the previous image if the replacement upload fails', async () => {
    cloud.uploadImage.mockRejectedValue(new Error('Provider failure'));
    const update = new UpdateProductoImagenUseCase(repository as never, cloud as never);
    await expect(update.ejecutar(1, { url: file })).rejects.toThrow('Provider failure');
    expect(repository.update).not.toHaveBeenCalled(); expect(cloud.deleteImage).not.toHaveBeenCalled();
  });
  it('preserves the previous image and compensates the new upload if update persistence fails', async () => {
    repository.update.mockRejectedValue(new Error('DB failure'));
    const update = new UpdateProductoImagenUseCase(repository as never, cloud as never);
    await expect(update.ejecutar(1, { url: file })).rejects.toThrow('DB failure');
    expect(cloud.deleteImage).toHaveBeenCalledTimes(1); expect(cloud.deleteImage).toHaveBeenCalledWith('new');
  });
  it('deletes the previous resource only after successfully persisting its replacement', async () => {
    repository.update.mockImplementation((image: ProductoImagen) => Promise.resolve(image));
    const update = new UpdateProductoImagenUseCase(repository as never, cloud as never);
    expect((await update.ejecutar(1, { url: file })).publicId).toBe('new');
    expect(repository.update.mock.invocationCallOrder[0]).toBeLessThan(cloud.deleteImage.mock.invocationCallOrder[0]);
    expect(cloud.deleteImage).toHaveBeenCalledTimes(1); expect(cloud.deleteImage).toHaveBeenCalledWith('old');
  });
});
