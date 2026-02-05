'use client';

import React, { useState, useEffect } from 'react';
import { useStorage } from '../../contexts/StorageContext';
import { useUser, RedirectToSignIn } from '@clerk/nextjs';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AccountPage() {
    const { user, isLoaded } = useUser();
    const { userProfile, updateUserProfile } = useStorage();
    const { t } = useLanguage();

    const [displayName, setDisplayName] = useState('');
    const [shopName, setShopName] = useState('');
    const [roasterMachine, setRoasterMachine] = useState('');
    const [roasterSize, setRoasterSize] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync form with loaded profile
    useEffect(() => {
        if (userProfile) {
            setDisplayName(userProfile.displayName || '');
            setShopName(userProfile.shopName || '');
            setRoasterMachine(userProfile.roasterMachine || '');
            setRoasterSize(userProfile.roasterSize || '');
        }
    }, [userProfile]);

    if (!isLoaded) return <div className="p-8 text-center text-slate-500">Loading auth...</div>;

    // Auth Guard
    if (!user) {
        return <RedirectToSignIn />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            await updateUserProfile({
                displayName,
                shopName,
                roasterMachine,
                roasterSize
            });
            setMessage({ type: 'success', text: 'プロフィールを更新しました' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: '更新に失敗しました' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">アカウント設定</h1>
            <p className="text-slate-500 mb-8">お客様の情報と焙煎環境の設定</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center space-x-4">
                        <img
                            src={user.imageUrl}
                            alt="Profile"
                            className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{user.fullName || user.username || 'User'}</h2>
                            <p className="text-sm text-slate-500">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ユーザー名 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                ユーザー名 (表示名)
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="例: コーヒー太郎"
                            />
                        </div>

                        {/* 屋号 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                屋号 / 店名
                            </label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="例: もちもちコーヒー"
                            />
                        </div>

                        {/* 焙煎機メーカー */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                焙煎機 (メーカー/機種)
                            </label>
                            <input
                                type="text"
                                value={roasterMachine}
                                onChange={(e) => setRoasterMachine(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="例: Fuji Royal R-101, Aillio Bullet"
                            />
                        </div>

                        {/* 焙煎機サイズ */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                公称バッチサイズ
                            </label>
                            <input
                                type="text"
                                value={roasterSize}
                                onChange={(e) => setRoasterSize(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                placeholder="例: 1kg, 500g"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center
                                ${isSaving ? 'opacity-80' : ''}
                            `}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    保存中...
                                </>
                            ) : '変更を保存'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                <h3 className="font-semibold text-slate-700 mb-2">💡 ご入力いただいた情報の活用について</h3>
                <p>
                    これらの情報は、将来的に実装予定の「焙煎プロファイル共有機能」や「マシンスペックに応じた原価シミュレーション」等の機能向上のために活用させていただきます。<br />
                    公開設定を行わない限り、他のユーザーに公開されることはありません。
                </p>
            </div>
        </div>
    );
}
