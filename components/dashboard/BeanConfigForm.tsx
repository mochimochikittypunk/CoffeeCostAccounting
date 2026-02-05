'use client';

import React, { useState } from 'react';
import { Bean, PriceInputMode } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStorage } from '../../contexts/StorageContext';
import { NumberInput } from '../ui/NumberInput';
import { CoffeePriceLabel } from './CoffeePriceLabel';
import { ChevronDown } from 'lucide-react';

interface BeanConfigFormProps {
    beans: Bean[];
    activeBeanId: string;
    onSelectBean: (id: string) => void;
    onUpdateBean: (id: string, updates: Partial<Bean>) => void;
}

export const BeanConfigForm: React.FC<BeanConfigFormProps> = ({ beans, activeBeanId, onSelectBean, onUpdateBean }) => {
    const { t } = useLanguage();
    const { inventory } = useStorage();
    const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);

    const activeBean = beans.find(b => b.id === activeBeanId) || beans[0];
    const currentPriceMode = activeBean.priceInputMode || 'active_total';

    const handlePriceModeChange = (mode: PriceInputMode) => {
        if (mode === 'active_per_kg') {
            const currentUnit = activeBean.purchaseWeightKg > 0
                ? Math.round(activeBean.purchasePrice / activeBean.purchaseWeightKg)
                : 0;
            onUpdateBean(activeBeanId, { priceInputMode: mode, enteredUnitPrice: currentUnit });
        } else {
            onUpdateBean(activeBeanId, { priceInputMode: mode });
        }
    };

    const displayPrice = currentPriceMode === 'active_total'
        ? activeBean.purchasePrice
        : (activeBean.enteredUnitPrice !== undefined ? activeBean.enteredUnitPrice : 0);

    const handlePriceChange = (val: number) => {
        if (currentPriceMode === 'active_total') {
            onUpdateBean(activeBeanId, { purchasePrice: val });
        } else {
            const newTotal = val * activeBean.purchaseWeightKg;
            onUpdateBean(activeBeanId, { enteredUnitPrice: val, purchasePrice: newTotal });
        }
    };

    const handleWeightChange = (val: number) => {
        if (currentPriceMode === 'active_total') {
            onUpdateBean(activeBeanId, { purchaseWeightKg: val });
        } else {
            const currentPerKg = activeBean.enteredUnitPrice !== undefined
                ? activeBean.enteredUnitPrice
                : (activeBean.purchaseWeightKg > 0 ? activeBean.purchasePrice / activeBean.purchaseWeightKg : 0);

            const newTotal = currentPerKg * val;
            onUpdateBean(activeBeanId, { purchaseWeightKg: val, purchasePrice: newTotal, enteredUnitPrice: currentPerKg });
        }
    };

    const handleSelectFromInventory = (inventoryItemId: string) => {
        const item = inventory.find(i => i.id === inventoryItemId);
        if (item) {
            // Auto-fill bean data from inventory item
            onUpdateBean(activeBeanId, {
                name: item.name,
                purchaseWeightKg: item.stockWeightKg,
                purchasePrice: item.costPricePerKg * item.stockWeightKg,
                priceInputMode: 'active_total',
            });
        }
        setShowInventoryDropdown(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            {/* Tabs */}
            <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto">
                {beans.map((bean, idx) => (
                    <button
                        key={bean.id}
                        onClick={() => onSelectBean(bean.id)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${bean.id === activeBeanId
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        {bean.name || `Bean ${idx + 1}`}
                    </button>
                ))}
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Name with Inventory Selector */}
                <div className="md:col-span-12">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.beanConfig.nameLabel}</label>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full p-2 pr-10 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900"
                            placeholder={t.beanConfig.namePlaceholder}
                            value={activeBean.name}
                            onChange={(e) => onUpdateBean(activeBeanId, { name: e.target.value })}
                        />
                        {inventory.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="在庫から選択"
                            >
                                <ChevronDown size={18} />
                            </button>
                        )}
                        {/* Inventory Dropdown */}
                        {showInventoryDropdown && inventory.length > 0 && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                <div className="p-2 text-xs font-medium text-slate-500 border-b border-slate-100">
                                    📦 在庫から選択（名前・原価・重量を自動入力）
                                </div>
                                {inventory.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelectFromInventory(item.id)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex justify-between items-center"
                                    >
                                        <span className="text-slate-900">{item.name}</span>
                                        <span className="text-slate-500 text-xs">
                                            ¥{item.costPricePerKg.toLocaleString()}/kg • {item.stockWeightKg}kg
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <CoffeePriceLabel
                        initialQuery={activeBean.name}
                    />
                </div>

                {/* Price Input Mode Toggle */}
                <div className="md:col-span-12">
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => handlePriceModeChange('active_total')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentPriceMode === 'active_total' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t.beanConfig.priceMode.total}
                        </button>
                        <button
                            onClick={() => handlePriceModeChange('active_per_kg')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentPriceMode === 'active_per_kg' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t.beanConfig.priceMode.perKg}
                        </button>
                    </div>
                </div>

                {/* Price & Weight */}
                <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {currentPriceMode === 'active_total' ? t.beanConfig.purchasePrice : `${t.beanConfig.purchasePrice} (1kg)`}
                    </label>
                    <div className="relative">
                        <NumberInput
                            className="w-full p-2 pr-8 border border-slate-300 rounded-md shadow-sm text-slate-900"
                            value={displayPrice}
                            onChange={handlePriceChange}
                            step={100}
                        />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">
                            {currentPriceMode === 'active_total' ? t.common.unitYen : '/kg'}
                        </span>
                    </div>
                    {currentPriceMode === 'active_per_kg' && (
                        <p className="text-xs text-slate-400 mt-1">
                            {t.profitAnalysis.totalInvestment}: ¥ {activeBean.purchasePrice.toLocaleString()}
                        </p>
                    )}
                </div>

                <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.beanConfig.purchaseWeight}</label>
                    <div className="relative">
                        <NumberInput
                            className="w-full p-2 pr-8 border border-slate-300 rounded-md shadow-sm text-slate-900"
                            value={activeBean.purchaseWeightKg}
                            onChange={handleWeightChange}
                            step={0.1}
                        />
                        <span className="absolute right-3 top-2 text-slate-400 text-sm">{t.common.unitKg}</span>
                    </div>
                </div>

                <div className="md:col-span-12 border-t border-slate-100 my-2"></div>

                {/* Margins */}
                <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t.beanConfig.targetRateRetail}
                        <span className="float-right font-bold text-blue-600">{activeBean.targetRateRetail}%</span>
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="80"
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        value={activeBean.targetRateRetail}
                        onChange={(e) => onUpdateBean(activeBeanId, { targetRateRetail: Number(e.target.value) })}
                    />
                </div>

                <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t.beanConfig.targetRateWholesale}
                        <span className="float-right font-bold text-slate-600">{activeBean.targetRateWholesale}%</span>
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="80"
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                        value={activeBean.targetRateWholesale}
                        onChange={(e) => onUpdateBean(activeBeanId, { targetRateWholesale: Number(e.target.value) })}
                    />
                </div>
            </div>
        </div>
    );
};
