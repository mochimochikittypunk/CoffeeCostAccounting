'use client';

import React, { useEffect, useState } from 'react';
import { useUser, RedirectToSignIn } from '@clerk/nextjs';

// Admin email check
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

interface ProfileData {
    id: string;
    user_id: string;
    email: string | null;
    display_name: string | null;
    shop_name: string | null;
    roaster_machine: string | null;
    roaster_size: string | null;
    access_count: number | null;
    last_active_at: string | null;
    credits: number;
}

interface FeatureStats {
    feature_name: string;
    usage_count: number;
}

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    const [featureStats, setFeatureStats] = useState<FeatureStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check admin access
    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

    useEffect(() => {
        if (!isLoaded || !isAdmin) return;

        const fetchData = async () => {
            try {
                // For now, we'll use the API route to fetch admin data
                const response = await fetch('/api/admin/stats');
                if (!response.ok) {
                    throw new Error('Failed to fetch admin data');
                }
                const data = await response.json();
                setProfiles(data.profiles || []);
                setFeatureStats(data.featureStats || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoaded, isAdmin]);

    if (!isLoaded) {
        return <div className="p-8 text-center text-slate-500">Loading...</div>;
    }

    if (!user) {
        return <RedirectToSignIn />;
    }

    if (!isAdmin) {
        return (
            <div className="p-8 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">アクセス権限がありません</h1>
                <p className="text-slate-600">この画面は管理者のみアクセス可能です。</p>
            </div>
        );
    }

    const featureLabels: Record<string, string> = {
        'single_origin': '☕ シングルオリジン',
        'blend': '🔄 ブレンド',
        'set': '🛍️ セット商品',
        'inventory': '📦 在庫管理'
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                👑 管理画面
            </h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center text-slate-500 py-12">データを読み込み中...</div>
            ) : (
                <>
                    {/* Feature Usage Stats */}
                    <section className="mb-8">
                        <h2 className="text-lg font-semibold text-slate-700 mb-4">📊 機能利用状況</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {featureStats.length > 0 ? featureStats.map((stat) => (
                                <div key={stat.feature_name} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                    <div className="text-sm text-slate-500 mb-1">
                                        {featureLabels[stat.feature_name] || stat.feature_name}
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800">
                                        {stat.usage_count.toLocaleString()} 回
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-4 text-slate-500 text-sm">まだ利用データがありません</div>
                            )}
                        </div>
                    </section>

                    {/* User List */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-700 mb-4">👥 登録ユーザー一覧</h2>
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-medium text-slate-600">ユーザー</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-600">屋号</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-600">焙煎機</th>
                                            <th className="text-center px-4 py-3 font-medium text-slate-600">アクセス回数</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-600">最終ログイン</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {profiles.map((profile) => (
                                            <tr key={profile.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-800">
                                                        {profile.display_name || '(未設定)'}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {profile.email || profile.user_id}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {profile.shop_name || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {profile.roaster_machine ? (
                                                        <span>
                                                            {profile.roaster_machine}
                                                            {profile.roaster_size && ` (${profile.roaster_size})`}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                        {profile.access_count || 0} 回
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">
                                                    {profile.last_active_at
                                                        ? new Date(profile.last_active_at).toLocaleString('ja-JP')
                                                        : '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                        {profiles.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                    登録ユーザーがいません
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            全 {profiles.length} ユーザー
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
