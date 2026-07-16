import { Request, Response, NextFunction } from 'express';
import { UploadUseCases } from '../../../application/use-cases/UploadUseCases';
import { AppError } from '../../../domain/errors/AppError';

export class UploadController {
  constructor(private uploadUseCases: UploadUseCases) {}

  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        throw new AppError('No se proporcionó ninguna imagen', 400, 'NO_FILE');
      }
      const result = await this.uploadUseCases.uploadImage(file.buffer, file.mimetype);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
