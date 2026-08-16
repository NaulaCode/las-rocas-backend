export const cleanPhone = (value?: string): string => (value || '').replace(/[^0-9]/g, '');

export const waLink = (value?: string, text?: string): string => {
  const base = `https://wa.me/${cleanPhone(value)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};
