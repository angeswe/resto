import { useContext } from 'react';
import { AppContextType } from '../contexts/AppContextWithTanstack';
import AppContext from '../contexts/AppContextWithTanstack';

/**
 * Hook to access the AppContext
 * @returns The AppContext value
 * @throws Error if used outside of AppContextProvider
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
