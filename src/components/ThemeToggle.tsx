import { useState } from 'react';
import { ToggleButton } from '@fluentui/react-components';
import { WeatherSunnyRegular, WeatherMoonRegular } from '@fluentui/react-icons';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved === 'dark' || (!saved && prefersDark);
  });

  function toggle() {
    const next = !dark;
    setDark(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { dark: next } }));
  }

  return (
    <ToggleButton
      appearance="subtle"
      checked={dark}
      onClick={toggle}
      icon={dark ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    />
  );
}
