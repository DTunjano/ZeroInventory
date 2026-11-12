import { BadRequestException } from '@nestjs/common';

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateProductImage(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
  if (!file?.buffer?.length) throw new BadRequestException('Selecciona una imagen');
  const buffer = file.buffer;
  if (buffer.length > MAX_PRODUCT_IMAGE_BYTES) throw new BadRequestException('La imagen admite máximo 5 MB');
  const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  const webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (!((file.mimetype === 'image/png' && png) || (file.mimetype === 'image/jpeg' && jpeg) || (file.mimetype === 'image/webp' && webp))) {
    throw new BadRequestException('Selecciona un archivo PNG, JPEG o WebP válido');
  }
}
