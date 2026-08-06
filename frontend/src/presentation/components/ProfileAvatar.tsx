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

function getRandomPortrait(name: string) {
  const key = (name || '').trim() || 'visitante';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const index = abs % 100;
  const gender = abs % 2 === 0 ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${index}.jpg`;
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
