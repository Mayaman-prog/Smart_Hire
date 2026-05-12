import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      const activeTheme = theme === "system" ? systemTheme : theme;

      root.setAttribute("data-theme", activeTheme);

      root.classList.remove("light", "dark");
      root.classList.add(activeTheme);
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
    }

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  // Function to toggle the theme between 'light', 'dark'
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
