import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  style?: TextStyle;
  onComplete?: () => void;
}

/**
 * Reveals text character by character, like a typewriter.
 * Speed is ms per character (default 30ms = brisk typing).
 */
export function TypewriterText({
  text,
  speed = 30,
  style,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <Text style={style}>
      {displayed}
      {!done && <Text style={{ opacity: 0.6 }}>|</Text>}
    </Text>
  );
}
