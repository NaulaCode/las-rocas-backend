import { useState, useEffect, useRef } from 'react';

interface AnimatedPriceProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedPrice({ value, prefix = '$', suffix = '', className = '' }: AnimatedPriceProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 800;
          const steps = 40;
          const stepVal = value / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += stepVal;
            if (current >= value) {
              setDisplay(value);
              clearInterval(interval);
            } else {
              setDisplay(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toFixed(2)}{suffix}
    </span>
  );
}
