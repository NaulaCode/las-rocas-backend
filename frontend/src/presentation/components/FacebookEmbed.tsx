import { useEffect, useRef } from 'react';

let sdkStatus: 'idle' | 'loading' | 'loaded' = 'idle';

function loadFbSdk() {
  if (sdkStatus !== 'idle' || typeof document === 'undefined') return;
  if (document.getElementById('facebook-jssdk')) {
    sdkStatus = 'loaded';
    return;
  }
  sdkStatus = 'loading';
  const s = document.createElement('script');
  s.async = true;
  s.defer = true;
  s.crossOrigin = 'anonymous';
  s.id = 'facebook-jssdk';
  s.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v21.0';
  s.onload = () => {
    sdkStatus = 'loaded';
  };
  document.head.appendChild(s);
}

function parseFb(el: HTMLElement | undefined) {
  const w = window as unknown as { FB?: { XFBML?: { parse: (el?: HTMLElement) => void } } };
  if (!w.FB?.XFBML?.parse) return;
  try {
    w.FB.XFBML.parse(el);
  } catch {
    // ignore
  }
}

export default function FacebookEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadFbSdk();
    const id = window.setTimeout(() => parseFb(ref.current ?? undefined), 300);
    return () => window.clearTimeout(id);
  }, [url]);
  return (
    <div
      ref={ref}
      className="fb-post w-full"
      data-href={url}
      data-show-text="false"
      data-width="500"
    />
  );
}
