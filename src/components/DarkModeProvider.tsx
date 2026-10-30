'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDark: boolean;
  toggle: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

export type ColorTheme = 'blue' | 'teal' | 'green' | 'orange' | 'rose';

const colorThemes: ColorTheme[] = ['blue', 'teal', 'green', 'orange', 'rose'];

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggle: () => {},
  colorTheme: 'blue',
  setColorTheme: () => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
}

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('blue');

  useEffect(() => {
    // Always default to light theme on first visit unless explicitly saved
    const stored = localStorage.getItem('autoping_dark_mode');
    const enabled = stored !== null ? stored === 'true' : false;
    setIsDark(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const storedTheme = localStorage.getItem('autoping_color_theme');
    const nextTheme = colorThemes.includes(storedTheme as ColorTheme)
      ? (storedTheme as ColorTheme)
      : 'blue';
    setColorThemeState(nextTheme);
    document.documentElement.dataset.colorTheme = nextTheme;
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('autoping_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('autoping_color_theme', theme);
    document.documentElement.dataset.colorTheme = theme;
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggle, colorTheme, setColorTheme }}>
      {children}
    </DarkModeContext.Provider>
  );
}
