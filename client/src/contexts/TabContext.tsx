import React, { createContext, useContext, useState, useEffect, Key } from 'react';

interface TabContextType {
  activeTab: Key;
  setActiveTab: (tab: Key) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Key>('settings');

  useEffect(() => {
    const savedTab = localStorage.getItem('projectSettingsTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('projectSettingsTab', activeTab as string);
  }, [activeTab]);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabContext must be used within a TabContextProvider');
  }
  return context;
};

export default TabContext;
