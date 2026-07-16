export interface UploadResult {
  url: string;
}

export interface IUploadRepository {
  image(file: File): Promise<UploadResult>;
}
