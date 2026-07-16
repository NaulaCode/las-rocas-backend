import { ICookieConsentStorage } from '../../domain/ports/ICookieConsentStorage';

export class CookieConsentStorageImpl implements ICookieConsentStorage {
  isAccepted(): boolean {
    try {
      return localStorage.getItem('cookies-accepted') === 'true';
    } catch {
      return false;
    }
  }

  accept(): void {
    try {
      localStorage.setItem('cookies-accepted', 'true');
    } catch { /* silent */ }
  }
}
