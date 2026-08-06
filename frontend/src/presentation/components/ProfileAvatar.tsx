import { useState } from 'react';

interface ProfileAvatarProps {
  name: string;
  photo?: string;
  size?: 'sm' | 'md' | 'lg';
  ring?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-24 h-24 text-xl',
};

function normalizeName(name: string) {
  return (name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const FEMALE_NAMES = new Set([
  'maria', 'ana', 'lucia', 'carmen', 'sofia', 'valentina', 'camila', 'isabella', 'daniela', 'gabriela',
  'valeria', 'samantha', 'sarah', 'emily', 'emma', 'olivia', 'mia', 'ava', 'mariana', 'fernanda',
  'carolina', 'andrea', 'alejandra', 'pamela', 'michelle', 'katherine', 'jennifer', 'vanessa', 'paula',
  'laura', 'natalia', 'domenica', 'melissa', 'nicole', 'scarlett', 'julissa', 'tatiana', 'veronica',
  'patricia', 'monica', 'sandra', 'ruth', 'beatriz', 'rosa', 'raquel', 'jessica', 'jazmin', 'karen',
  'wendy', 'estefania', 'sabrina', 'alicia', 'angela', 'barbara', 'belen', 'carla', 'cecilia', 'cristina',
  'diana', 'elena', 'elisa', 'emilia', 'erika', 'francisca', 'gloria', 'ines', 'irene', 'isabel',
  'julia', 'lourdes', 'luisa', 'margarita', 'martha', 'nieves', 'noelia', 'nuria', 'olga', 'paloma',
  'pilar', 'rebeca', 'rocio', 'salome', 'silvia', 'susana', 'teresa', 'victoria', 'yolanda', 'amanda',
  'adriana', 'alexandra', 'gisselle', 'joselin', 'joseline', 'katiuska', 'marisol', 'viviana', 'ximena',
  'zoila', 'yessenia', 'fatima', 'milena', 'anthonella', 'alisson', 'brianna', 'nathaly', 'scarlet',
]);

const MALE_NAMES = new Set([
  'juan', 'jose', 'carlos', 'luis', 'miguel', 'antonio', 'francisco', 'pedro', 'manuel', 'angel',
  'david', 'jorge', 'diego', 'andres', 'alejandro', 'cristian', 'bryan', 'kevin', 'santiago', 'mateo',
  'sebastian', 'nicolas', 'daniel', 'gabriel', 'matias', 'joaquin', 'benjamin', 'samuel', 'lucas',
  'thiago', 'tomas', 'ian', 'liam', 'noah', 'ethan', 'ryan', 'adrian', 'alan', 'alexander', 'alberto',
  'alfredo', 'armando', 'arturo', 'bernardo', 'cesar', 'christopher', 'cristobal', 'eduardo', 'emiliano',
  'enrique', 'ernesto', 'esteban', 'fabian', 'fernando', 'gerardo', 'gonzalo', 'guillermo', 'gustavo',
  'hector', 'hugo', 'ignacio', 'isaac', 'ismael', 'ivan', 'javier', 'jesus', 'jonathan', 'julio',
  'leonardo', 'lorenzo', 'marcos', 'mario', 'martin', 'mauricio', 'maximiliano', 'oscar', 'pablo',
  'patricio', 'rafael', 'ramon', 'raul', 'ricardo', 'roberto', 'rodrigo', 'ruben', 'salvador', 'sergio',
  'vicente', 'victor', 'xavier', 'stiven', 'steven', 'kevin', 'dylan', 'jordy', 'jeremy', 'erick',
  'erick', 'dario', 'fausto', 'german', 'lenin', 'mauro', 'nelson', 'orlando', 'roberto', 'washington',
  'wilson', 'dennis', 'douglas', 'freire', 'jefferson', 'jose', 'antonio', 'geovanny', 'marvin',
]);

function detectGender(name: string): 'men' | 'women' {
  const first = normalizeName(name).split(/\s+/)[0] || '';
  if (!first) return 'men';
  if (FEMALE_NAMES.has(first)) return 'women';
  if (MALE_NAMES.has(first)) return 'men';
  if (first.endsWith('a') && !first.endsWith('ma') && !first.endsWith('ola')) return 'women';
  if (first.endsWith('o') || first.endsWith('r') || first.endsWith('n')) return 'men';
  return 'men';
}

function getRandomPortrait(name: string) {
  const key = (name || '').trim() || 'visitante';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const index = abs % 100;
  return `https://randomuser.me/api/portraits/${detectGender(name)}/${index}.jpg`;
}

export default function ProfileAvatar({ name, photo, size = 'md', ring = true }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = photo || getRandomPortrait(name);
  const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (failed || (!photo && !name.trim())) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/30 flex-shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${ring ? 'p-[3px] bg-gradient-to-br from-primary-400 via-primary-500 to-accent-400 shadow-md shadow-primary-500/30' : ''} rounded-full flex-shrink-0`}>
      <img src={src} alt={name} onError={() => setFailed(true)} loading="lazy"
        className={`w-full h-full rounded-full object-cover ${ring ? 'border-2 border-white' : ''}`} />
    </div>
  );
}
