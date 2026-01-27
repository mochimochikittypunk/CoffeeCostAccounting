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
                            {/* Desktop: Single line title */}
                            <h1 className="text-lg font-bold text-slate-900 leading-none hidden sm:block">{t.common.title}</h1>
                            {/* Mobile: Two-line title */}
                            <h1 className="text-base font-bold text-slate-900 leading-tight sm:hidden">
                                コーヒー原価計算<br />価格シミュレータ
                            </h1>
                            {/* Subtitle hidden on mobile to save space, shown on sm+ */}
                            <span className="text-slate-400 font-normal text-xs hidden sm:inline">{t.common.subtitle}</span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <a href="https://square.link/u/CYYWh8wX" target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                        🎁 <span className="hidden sm:inline">{t.common.supportDev}</span>
                        <span className="sm:hidden">応援する</span>
                    </a>
                </div>
            </div>
        </header>
    );
};
