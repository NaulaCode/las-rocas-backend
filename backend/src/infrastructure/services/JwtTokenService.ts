import jwt from 'jsonwebtoken';
import { ITokenService } from '../../domain/ports/ITokenService';
import { config } from '../../shared/config/config';

export class JwtTokenService implements ITokenService {
  sign(payload: Record<string, unknown>, options?: { expiresIn?: string }): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: options?.expiresIn || config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  verify<T extends Record<string, unknown>>(token: string): T {
    return jwt.verify(token, config.jwt.secret) as T;
  }
}
