import { useMemo } from 'react';

interface Props {
  password: string;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!password || password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Una mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Una minúscula');
  if (!/[0-9]/.test(password)) errors.push('Un número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Un carácter especial');
  return { valid: errors.length === 0, errors };
}

function getStrength(password: string): { level: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (score <= 2) return { level: 0, label: 'Débil', color: 'bg-red-500' };
  if (score <= 3) return { level: 1, label: 'Media', color: 'bg-yellow-500' };
  if (score <= 4) return { level: 2, label: 'Buena', color: 'bg-blue-500' };
  return { level: 3, label: 'Fuerte', color: 'bg-green-500' };
}

export default function PasswordStrength({ password }: Props) {
  const { level, label, color } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= level ? color : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs ${level === 0 ? 'text-red-500' : level === 1 ? 'text-yellow-600' : level === 2 ? 'text-blue-600' : 'text-green-600'}`}>{label}</p>
    </div>
  );
}
