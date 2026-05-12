// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // On component mount, check localStorage for saved theme
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    }

    // Apply the current theme to the <html> tag
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Function to toggle the theme between 'light', 'dark'
  const toggleTheme = () => {
    const newTheme =
      theme === "light" ? "dark" : "light";

    setTheme(newTheme); // Update theme state
    localStorage.setItem("theme", newTheme); // Save new theme to localStorage
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
