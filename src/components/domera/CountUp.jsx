'use client';
import { useEffect, useRef, useState } from 'react';

export default function CountUp({ value, suffix = '', duration = 900, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: 'inline-block',
        opacity: visible ? 1 : 0.82,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
    >
      {value}
      {suffix}
    </span>
  );
}
