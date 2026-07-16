import { useEffect, useRef } from 'react';

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [e.ctrlKey || e.metaKey ? 'Ctrl' : '', e.altKey ? 'Alt' : '', e.shiftKey ? 'Shift' : '', e.key.toUpperCase()].filter(Boolean).join('+');
      const fn = ref.current[key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
