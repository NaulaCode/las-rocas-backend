const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PHONE_REGEX = /^\+?\d{7,15}$/;

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  return PHONE_REGEX.test(phone.replace(/[\s-]/g, ''));
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, '');
}
