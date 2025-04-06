import { createContext, Key } from 'react';

interface TabContextType {
  activeTab: Key;
  setActiveTab: (tab: Key) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export default TabContext;