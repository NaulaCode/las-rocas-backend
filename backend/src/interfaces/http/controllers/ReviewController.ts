import { Request, Response, NextFunction } from 'express';
import { ReviewUseCases } from '../../../application/use-cases/ReviewUseCases';

export class ReviewController {
  constructor(private reviewUseCases: ReviewUseCases) {}

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await this.reviewUseCases.submit(req.body);
      res.status(201).json({ status: 'success', message: 'Reseña enviada. Será publicada tras revisión.', data: review });
    } catch (error) { next(error); }
  }

  async getAll(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { approved, serviceName } = req.query;
      const reviews = await this.reviewUseCases.getAll({
        approved: approved !== undefined ? approved === 'true' : undefined,
        serviceName,
      });
      res.status(200).json({ status: 'success', data: reviews });
    } catch (error) { next(error); }
  }

  async getApproved(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceName } = req.query;
      const reviews = await this.reviewUseCases.getApproved(serviceName as string | undefined);
      res.status(200).json({ status: 'success', data: reviews });
    } catch (error) { next(error); }
  }

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.reviewUseCases.approve(req.params.id as string);
      res.status(200).json({ status: 'success', message: 'Reseña aprobada' });
    } catch (error) { next(error); }
  }

  async delete(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.reviewUseCases.delete(req.params.id as string);
      res.status(200).json({ status: 'success', message: 'Reseña eliminada' });
    } catch (error) { next(error); }
  }

  async getAverageByService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceName } = req.query;
      if (!serviceName) {
        res.status(400).json({ status: 'error', message: 'serviceName es requerido' });
        return;
      }
      const result = await this.reviewUseCases.getAverageByService(serviceName as string);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }
}
