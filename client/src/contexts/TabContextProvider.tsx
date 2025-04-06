import React, { useState, useEffect, Key } from 'react';
import TabContext from './TabContext';

export const TabContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<Key>('settings');

    useEffect(() => {
        const savedTab = localStorage.getItem('projectSettingsTab');
        if (savedTab) {
            setActiveTab(savedTab as Key);
        } else {
            setActiveTab('settings' as Key);
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

export default TabContextProvider;