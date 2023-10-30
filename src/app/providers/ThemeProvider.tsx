import React, { useEffect, useState } from 'react';
import { getInitialTheme } from '@app/utils/themeUtils';
import { githubGist, dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const initialState = {
  theme: '',
  toggleTheme: () => {},
  syntaxHighLighterTheme: ''
};

export const ThemeContext = React.createContext(initialState);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const syntaxHighLighterTheme = theme === 'dark' ? dracula : githubGist;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('pf-v5-theme-dark');
    } else {
      document.documentElement.classList.remove('pf-v5-theme-dark');
    }

    if (localStorage) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previousTheme) => (previousTheme === 'light' ? 'dark' : 'light'));
  };
  const themeState = {
    theme,
    toggleTheme,
    syntaxHighLighterTheme
  };
  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
};

export { ThemeProvider };
