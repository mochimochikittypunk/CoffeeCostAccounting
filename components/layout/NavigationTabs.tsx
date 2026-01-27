'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const NavigationTabs: React.FC = () => {
    const { t } = useLanguage();
    const pathname = usePathname();

    const isBlend = pathname === '/blend';

    return (
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    {/* Left: Navigation Tabs */}
                    <div className="flex space-x-4 h-full">
                        <Link
                            href="/"
                            className={`inline-flex items-center px-1 border-b-2 text-sm font-medium h-full transition-colors ${pathname === '/'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            ☕ {t.common.nav.single}
                        </Link>
                        <Link
                            href="/blend"
                            className={`inline-flex items-center px-1 border-b-2 text-sm font-medium h-full transition-colors ${isBlend
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            🔄 {t.common.nav.blend}
                        </Link>
                    </div>

                    {/* Right: Language */}
                    <div className="flex items-center">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </div>
    );
};
