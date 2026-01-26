'use client';

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageSwitcher = () => {
    const { locale, setLocale } = useLanguage();

    const toggle = () => {
        setLocale(locale === 'ja' ? 'en' : 'ja');
    };

    return (
        <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
            title={locale === 'ja' ? 'Switch to English' : '日本語に切り替え'}
        >
            <Languages size={14} />
            <span>{locale === 'ja' ? 'English' : '日本語'}</span>
        </button>
    );
};
