import { IUploadRepository, UploadResult } from '../../../domain/ports/IUploadRepository';
import { apiClient } from '../ApiClient';

export class UploadRepositoryImpl implements IUploadRepository {
  image(file: File): Promise<UploadResult> {
    return apiClient.upload(file);
  }
}
