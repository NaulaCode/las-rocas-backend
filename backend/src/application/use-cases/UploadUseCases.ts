import { IUploadService, UploadResult } from '../../domain/ports/IUploadService';
import { AppError } from '../../domain/errors/AppError';

export class UploadUseCases {
  constructor(private uploadService: IUploadService) {}

  async uploadImage(fileBuffer: Buffer, mimeType: string): Promise<UploadResult> {
    if (!fileBuffer) {
      throw new AppError('No se proporcionó ninguna imagen', 400, 'NO_FILE');
    }

    return this.uploadService.uploadImage(fileBuffer, mimeType);
  }
}
