import { useEffect, useRef, useState } from 'react';
import { Text, type TextProps } from 'react-native';

interface Props extends TextProps {
  value: number;
  duration?: number;
}

/** Counts up to `value` (eased) whenever it changes. JS-thread, but only this
 * isolated component re-renders. */
export function AnimatedNumber({ value, duration = 700, ...rest }: Props) {
  // Start at 0 so the first render counts up into view, matching the ring.
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = to;
    if (from === to) return;

    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <Text {...rest}>{display}</Text>;
}
