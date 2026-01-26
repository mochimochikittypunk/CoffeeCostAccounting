'use client';

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Coffee, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const Header: React.FC = () => {
    const { t } = useLanguage();
    const pathname = usePathname();

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Coffee size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-slate-900 leading-none">{t.common.title}</h1>
                            <span className="text-slate-400 font-normal text-xs">{t.common.subtitle}</span>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-1">
                        <Link
                            href="/"
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {t.common.nav.single}
                        </Link>
                        <Link
                            href="/blend"
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/blend'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {t.common.nav.blend}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile Nav Toggle could go here, but keeping simple for now */}
                    <div className="md:hidden flex space-x-2 mr-2">
                        <Link href="/" className={`text-xs p-1 ${pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>{t.common.nav.single}</Link>
                        <Link href="/blend" className={`text-xs p-1 ${pathname === '/blend' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>{t.common.nav.blend}</Link>
                    </div>

                    <LanguageSwitcher />
                    <a href="https://square.link/u/CYYWh8wX" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                        🎁 <span className="hidden sm:inline">{t.common.supportDev}</span>
                    </a>
                </div>
            </div>
        </header>
    );
};
