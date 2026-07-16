import cloudinary from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { IUploadService, UploadResult } from '../../domain/ports/IUploadService';
import { config } from '../../shared/config/config';

cloudinary.v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const UPLOADS_DIR = path.join(__dirname, '../../../../uploads');

export class CloudinaryUploadService implements IUploadService {
  async uploadImage(fileBuffer: Buffer, mimeType: string): Promise<UploadResult> {
    const hasCloudinaryConfig = config.cloudinary.cloudName;

    if (hasCloudinaryConfig) {
      const b64 = Buffer.from(fileBuffer).toString('base64');
      const dataUri = `data:${mimeType};base64,${b64}`;
      const isVideo = mimeType.startsWith('video/');
      const result = await cloudinary.v2.uploader.upload(dataUri, {
        folder: 'lasrocas',
        resource_type: isVideo ? 'video' : 'image',
      });
      return { url: result.secure_url, publicId: result.public_id };
    }

    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), fileBuffer);
    return { url: `/uploads/${filename}`, publicId: null };
  }
}
