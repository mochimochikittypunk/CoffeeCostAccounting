'use client';

import React from 'react';
import { FeeSettings, PlatformType, PaymentMethod, SaleType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { CreditCard, Store, ShoppingBag } from 'lucide-react';
import { NumberInput } from '../ui/NumberInput';

interface FeeSimulatorProps {
    settings: FeeSettings;
    onChange: (newSettings: FeeSettings) => void;
}

export const FeeSimulator: React.FC<FeeSimulatorProps> = ({ settings, onChange }) => {
    const { t } = useLanguage();

    const handleModeChange = (type: SaleType) => {
        onChange({ ...settings, saleType: type });
    };

    const handlePlatformChange = (type: PlatformType) => {
        onChange({ ...settings, platformType: type });
    };

    const handlePaymentChange = (type: PaymentMethod) => {
        onChange({ ...settings, paymentMethod: type });
    };

    const onlinePlatforms: { id: string; name: string; types: PlatformType[] }[] = [
        { id: 'BASE', name: 'BASE', types: ['BASE_STANDARD', 'BASE_GROWTH'] },
        { id: 'STORES', name: 'STORES', types: ['STORES_FREE', 'STORES_STANDARD'] },
        { id: 'SHOPIFY', name: 'Shopify', types: ['SHOPIFY_BASIC', 'SHOPIFY_STANDARD', 'SHOPIFY_ADVANCED'] },
        { id: 'CUSTOM', name: t.feeSimulator.plans.CUSTOM, types: ['CUSTOM'] }
    ];

    const paymentMethods: PaymentMethod[] = ['CASH', 'CREDIT_CARD', 'PAYPAY', 'QUICPAY', 'TRANSPORT_IC', 'CUSTOM'];

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-4">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                {t.feeSimulator.title}
            </h3>

            {/* Mode Toggles */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={() => handleModeChange('IN_STORE')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${settings.saleType === 'IN_STORE'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                >
                    <Store size={16} />
                    {t.feeSimulator.mode.inStore}
                </button>
                <button
                    onClick={() => handleModeChange('ONLINE')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${settings.saleType === 'ONLINE'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                >
                    <ShoppingBag size={16} />
                    {t.feeSimulator.mode.online}
                </button>
            </div>

            {/* Content based on Mode */}
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">

                {/* IN STORE MODE */}
                {settings.saleType === 'IN_STORE' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {paymentMethods.map(pm => (
                                <button
                                    key={pm}
                                    onClick={() => handlePaymentChange(pm)}
                                    className={`text-left text-xs p-2 rounded-md border transition-all ${settings.paymentMethod === pm
                                            ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`font-medium ${settings.paymentMethod === pm ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {t.feeSimulator.paymentMethods[pm]}
                                    </div>
                                    <div className={`text-[10px] mt-0.5 ${settings.paymentMethod === pm ? 'text-blue-600/80' : 'text-slate-400'}`}>
                                        {t.feeSimulator.descriptions[pm]}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ONLINE MODE */}
                {settings.saleType === 'ONLINE' && (
                    <>
                        {onlinePlatforms.map(group => (
                            <div key={group.id} className="space-y-1">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{group.name}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {group.types.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => handlePlatformChange(type)}
                                            className={`text-left text-xs p-2 rounded-md border transition-all ${settings.platformType === type
                                                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`font-medium ${settings.platformType === type ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {t.feeSimulator.plans[type]}
                                            </div>
                                            <div className={`text-[10px] mt-0.5 ${settings.platformType === type ? 'text-blue-600/80' : 'text-slate-400'}`}>
                                                {t.feeSimulator.descriptions[type]}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-2 border-t border-slate-100">
                            <label className="text-xs text-slate-500">{t.feeSimulator.shippingCost}</label>
                            <NumberInput
                                value={settings.shippingCost}
                                onChange={(v) => onChange({ ...settings, shippingCost: v })}
                                className="w-full text-sm p-1.5 border border-slate-200 rounded"
                                placeholder="0"
                            />
                        </div>
                    </>
                )}

                {/* Common Custom Rate Input */}
                {(
                    (settings.saleType === 'ONLINE' && settings.platformType === 'CUSTOM') ||
                    (settings.saleType === 'IN_STORE' && settings.paymentMethod === 'CUSTOM')
                ) && (
                        <div>
                            <label className="text-xs text-slate-500">{t.feeSimulator.rate}</label>
                            <NumberInput
                                value={settings.customFeeRate}
                                onChange={(v) => onChange({ ...settings, customFeeRate: v })}
                                className="w-full text-sm p-1.5 border border-slate-200 rounded"
                            />
                        </div>
                    )}

            </div>
        </div>
    );
};
