'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

import { useStorage } from '../../contexts/StorageContext';

// Admin email check
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export const NavigationTabs: React.FC = () => {
    const { t } = useLanguage();
    const { credits } = useStorage();
    const pathname = usePathname();
    const { user } = useUser();

    const isBlend = pathname === '/blend';
    const isSet = pathname === '/set';
    const isInventory = pathname === '/inventory';
    const isAdmin = pathname === '/admin';

    // Check if current user is admin
    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const isAdminUser = userEmail && ADMIN_EMAILS.includes(userEmail);

    return (
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    {/* Left: Navigation Tabs */}
                    <div className="flex space-x-4 h-full">
                        <Link
                            href="/"
                            className={`inline-flex items-center px-1 border-b-2 text-xs sm:text-sm font-medium h-full transition-colors ${pathname === '/'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            ☕ {t.common.nav.single}
                        </Link>
                        <Link
                            href="/blend"
                            className={`inline-flex items-center px-1 border-b-2 text-xs sm:text-sm font-medium h-full transition-colors ${isBlend
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            🔄 {t.common.nav.blend}
                        </Link>
                        <Link
                            href="/set"
                            className={`inline-flex items-center px-1 border-b-2 text-xs sm:text-sm font-medium h-full transition-colors ${isSet
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            🛍️ {t.common.nav.set}
                        </Link>
                        <Link
                            href="/inventory"
                            className={`inline-flex items-center px-1 border-b-2 text-xs sm:text-sm font-medium h-full transition-colors ${isInventory
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            📦 {t.common.nav.inventory || '在庫管理'}
                        </Link>
                        {/* Admin Link - Only shown for admin users */}
                        {isAdminUser && (
                            <Link
                                href="/admin"
                                className={`inline-flex items-center px-1 border-b-2 text-xs sm:text-sm font-medium h-full transition-colors ${isAdmin
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-slate-500 hover:text-purple-600 hover:border-purple-300'
                                    }`}
                            >
                                👑 管理画面
                            </Link>
                        )}
                    </div>

                    {/* Right: Language & Auth */}
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <div className="flex items-center">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-slate-50">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <span className="mr-1">🪙</span>
                                {credits}
                            </SignedIn>
                        </div>
                        <SignedIn>
                            <Link
                                href="/account"
                                className="mr-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                title="アカウント設定"
                            >
                                ⚙️
                            </Link>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </div>
    );
};
