import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from '../../../domain/errors/AppError';
import { config } from '../../../shared/config/config';

interface MulterFile {
  fieldname: string; originalname: string; encoding: string;
  mimetype: string; size: number; destination: string;
  filename: string; path: string; buffer: Buffer;
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (_req: Request, file: MulterFile, cb: FileFilterCallback) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const allowed = config.upload.allowedExtensions.join(', ');
      cb(new AppError(`Formato no permitido. Solo se aceptan: ${allowed}`, 400, 'INVALID_FILE_TYPE'));
    }
  },
});
