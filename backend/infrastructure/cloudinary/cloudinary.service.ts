import { Inject, Injectable } from '@nestjs/common';

import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
  DeleteApiResponse,
} from 'cloudinary';

import { Readable } from 'stream';

import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  uploadImage(
    file: any,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinaryClient.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);

          resolve(result!);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

  deleteImage(publicId: string): Promise<DeleteApiResponse> {
    return this.cloudinaryClient.uploader.destroy(publicId);
  }

  deleteMultipleImages(publicIds: string[]): Promise<DeleteApiResponse[]> {
    return Promise.all(publicIds.map((publicId) => this.deleteImage(publicId)));
  }
}
