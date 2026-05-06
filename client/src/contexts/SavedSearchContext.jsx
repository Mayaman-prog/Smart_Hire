import { createContext, useContext, useState } from "react";

const SavedSearchContext = createContext();

export const useSavedSearch = () => {
  const context = useContext(SavedSearchContext);
  if (!context) {
    throw new Error("useSavedSearch must be used within a SavedSearchProvider");
  }
  return context;
};

export const SavedSearchProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshSavedSearches = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <SavedSearchContext.Provider value={{ refreshTrigger, refreshSavedSearches }}>
      {children}
    </SavedSearchContext.Provider>
  );
};
