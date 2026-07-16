export interface UploadResult {
  url: string;
  publicId: string | null;
}

export interface IUploadService {
  uploadImage(fileBuffer: Buffer, mimeType: string): Promise<UploadResult>;
}
