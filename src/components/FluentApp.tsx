import { useState, useEffect } from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { evergreenLightTheme, evergreenDarkTheme } from '../theme/fluentTheme';
import AppsPage from './AppsPage';

interface FluentAppProps {
  base: string;
}

export default function FluentApp({ base }: FluentAppProps) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved === 'dark' || (!saved && prefersDark);
  });

  useEffect(() => {
    function handler(e: Event) {
      setIsDark((e as CustomEvent<{ dark: boolean }>).detail.dark);
    }
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  return (
    <FluentProvider theme={isDark ? evergreenDarkTheme : evergreenLightTheme}>
      <AppsPage base={base} />
    </FluentProvider>
  );
}
