import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // İlk yükleme
  useEffect(() => {
    const savedTheme = localStorage.getItem('dark_mode');
    setIsDarkMode(savedTheme === 'true');
  }, []);

  // Tema değiştiğinde uygula
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    if (isDarkMode) {
      body.classList.add('dark-mode');
      html.setAttribute('data-theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      html.removeAttribute('data-theme');
    }
    
    localStorage.setItem('dark_mode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 