export interface ITokenService {
  sign(payload: Record<string, unknown>, options?: { expiresIn?: string }): string;
  verify<T extends Record<string, unknown>>(token: string): T;
}
