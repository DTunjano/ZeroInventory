import { UpdateMediaUseCase } from './update-media.usecase';
import { MediaCloudinaryService } from '../infrastructure/cloudinary/media-cloudinary.service';
import { Media } from '../domain/media.models';
import { BadRequestException } from '@nestjs/common';

describe('Promotional media replacement', () => {
  const old = new Media(1, 'QA', null, 'https://example.test/old', 'old', 'video', 'activo', 0, new Date(), new Date());
  const repository = { findById: jest.fn(), update: jest.fn() };
  const cloud = { uploadVideo: jest.fn(), deleteVideo: jest.fn() };
  beforeEach(() => {
    jest.resetAllMocks(); repository.findById.mockResolvedValue(old);
    cloud.uploadVideo.mockResolvedValue({ secure_url: 'https://example.test/new', public_id: 'new' });
    cloud.deleteVideo.mockResolvedValue(undefined);
  });
  it('preserves the previous video when persistence of a replacement fails', async () => {
    repository.update.mockRejectedValue(new Error('DB failure'));
    const useCase = new UpdateMediaUseCase(repository as never, cloud as never);
    await expect(useCase.execute(1, {}, {} as Express.Multer.File)).rejects.toThrow('Error al actualizar el media');
    expect(cloud.deleteVideo).toHaveBeenCalledTimes(1);
    expect(cloud.deleteVideo).toHaveBeenCalledWith('new');
  });
  it('retires the old video after the replacement has been saved', async () => {
    repository.update.mockImplementation((_id: number, changes: Partial<Media>) => Promise.resolve({ ...old, ...changes }));
    const useCase = new UpdateMediaUseCase(repository as never, cloud as never);
    expect((await useCase.execute(1, {}, {} as Express.Multer.File)).publicId).toBe('new');
    expect(repository.update.mock.invocationCallOrder[0]).toBeLessThan(cloud.deleteVideo.mock.invocationCallOrder[0]);
    expect(cloud.deleteVideo).toHaveBeenCalledWith('old');
  });
  it('rejects a forged video signature before upload', async () => {
    const provider = { uploadImage: jest.fn(), deleteImage: jest.fn() };
    const service = new MediaCloudinaryService(provider as never);
    await expect(service.uploadVideo({ mimetype: 'video/mp4', size: 10, buffer: Buffer.from('not a video') } as Express.Multer.File)).rejects.toBeInstanceOf(BadRequestException);
    expect(provider.uploadImage).not.toHaveBeenCalled();
  });
  it('uses the video resource type when cleaning a video', async () => {
    const provider = { deleteImage: jest.fn().mockResolvedValue({ result: 'ok' }) };
    await new MediaCloudinaryService(provider as never).deleteVideo('qa-resource');
    expect(provider.deleteImage).toHaveBeenCalledWith('qa-resource', 'video');
  });
});
