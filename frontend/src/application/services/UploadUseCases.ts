import { IUploadRepository, UploadResult } from '../../domain/ports/IUploadRepository';

export class UploadUseCases {
  constructor(private repo: IUploadRepository) {}

  image(file: File): Promise<UploadResult> {
    return this.repo.image(file);
  }
}
