'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStorage } from '../../contexts/StorageContext';
import { InventoryCard } from '../../components/inventory/InventoryCard';
import { InventoryForm } from '../../components/inventory/InventoryForm';
import { InventoryStats } from '../../components/inventory/InventoryStats';
import { InventoryHistory } from '../../components/inventory/InventoryHistory';
import { FeatureGuard } from '../../components/auth/FeatureGuard';

export default function InventoryPage() {
    const { t } = useLanguage();
    const { inventory } = useStorage();
    const [showForm, setShowForm] = useState(false);

    return (
        <FeatureGuard message="在庫管理機能を利用するにはログインが必要です">
            <div className="min-h-screen bg-slate-50 pb-20">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">📦 {t.inventory?.title || '在庫管理'}</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {t.inventory?.subtitle || 'コーヒー豆の在庫状況を管理し、ビジネスインサイトを確認'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {showForm ? t.inventory.cancel : t.inventory.addItem}
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <InventoryStats />

                    {/* History (Undo) */}
                    <InventoryHistory />

                    {/* Add Form (Collapsible) */}
                    {showForm && (
                        <div className="mb-8">
                            <InventoryForm onComplete={() => setShowForm(false)} />
                        </div>
                    )}

                    {/* Inventory Grid */}
                    {inventory.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {t.inventory?.emptyTitle || '在庫がありません'}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                {t.inventory?.emptyMessage || '「新規追加」ボタンから在庫を登録してください'}
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {t.inventory.addFirst}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {inventory.map(item => (
                                <InventoryCard key={item.id} item={item} allItems={inventory} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </FeatureGuard>
    );
}
