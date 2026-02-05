'use client';

import React, { useState } from 'react';
import { useStorage } from '../../contexts/StorageContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface InventoryFormProps {
    onComplete?: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ onComplete }) => {
    const { addInventoryItem } = useStorage();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: '',
        stockWeightKg: 1,
        retailPrice: 800,
        wholesalePrice: 5000,
        costPricePerKg: 3000,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        addInventoryItem({
            name: formData.name.trim(),
            stockWeightKg: formData.stockWeightKg,
            retailPrice: formData.retailPrice,
            wholesalePrice: formData.wholesalePrice,
            costPricePerKg: formData.costPricePerKg,
        });

        // Reset form
        setFormData({
            name: '',
            stockWeightKg: 1,
            retailPrice: 800,
            wholesalePrice: 5000,
            costPricePerKg: 3000,
        });

        onComplete?.();
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.inventory.formTitle}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t.inventory.beanName} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder={t.inventory.beanNamePlaceholder}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                </div>

                {/* Stock Weight */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t.inventory.stockWeight}
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.stockWeightKg}
                        onChange={(e) => handleChange('stockWeightKg', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                </div>

                {/* Cost Price */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t.inventory.costPriceLabel}
                    </label>
                    <input
                        type="number"
                        step="100"
                        min="0"
                        value={formData.costPricePerKg}
                        onChange={(e) => handleChange('costPricePerKg', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                </div>

                {/* Retail Price */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t.inventory.retailPriceLabel}
                    </label>
                    <input
                        type="number"
                        step="10"
                        min="0"
                        value={formData.retailPrice}
                        onChange={(e) => handleChange('retailPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                </div>

                {/* Wholesale Price */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t.inventory.wholesalePriceLabel}
                    </label>
                    <input
                        type="number"
                        step="100"
                        min="0"
                        value={formData.wholesalePrice}
                        onChange={(e) => handleChange('wholesalePrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                    />
                </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onComplete}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    {t.inventory.cancel}
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {t.inventory.submitButton}
                </button>
            </div>
        </form>
    );
};
