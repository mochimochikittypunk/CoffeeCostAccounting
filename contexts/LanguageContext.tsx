'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, Dictionary, dictionaries } from '../locales/dictionary';

interface LanguageContextType {
    locale: Locale;
    t: Dictionary;
    setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState<Locale>('ja');

    const value = {
        locale,
        t: dictionaries[locale],
        setLocale
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
