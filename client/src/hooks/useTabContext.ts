import { useContext } from 'react';
import TabContext from '../contexts/TabContext';

export const useTabContext = () => {
    const context = useContext(TabContext);
    if (context === undefined) {
        throw new Error('useTabContext must be used within a TabContextProvider');
    }
    return context;
};

export default useTabContext;