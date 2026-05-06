import { Inject, Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';

import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  uploadImage(
    file: string,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return this.cloudinaryClient.uploader.upload(file, options);
  }
}
