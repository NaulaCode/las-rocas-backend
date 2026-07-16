import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

export interface TurnstileHandle {
  execute: () => void;
  reset: () => void;
}

interface Props {
  onToken: (token: string) => void;
}

const TurnstileWidget = forwardRef<TurnstileHandle, Props>(({ onToken }, ref) => {
  const siteKey = import.meta.env['VITE_TURNSTILE_SITE_KEY'] as string | undefined;
  const turnstileRef = useRef<TurnstileInstance>(null);

  useImperativeHandle(ref, () => ({
    execute: () => turnstileRef.current?.execute?.(),
    reset: () => turnstileRef.current?.reset?.(),
  }));

  if (!siteKey) return null;

  return (
    <Turnstile
      ref={turnstileRef}
      siteKey={siteKey}
      onSuccess={onToken}
      options={{ theme: 'light', size: 'invisible' }}
    />
  );
});

TurnstileWidget.displayName = 'TurnstileWidget';
export default TurnstileWidget;
