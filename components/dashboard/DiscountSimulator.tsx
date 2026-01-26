'use client';

import React, { useState, useEffect } from 'react';
import { Bean, GlobalSettings, FeeSettings } from '../../types';
import { calculateBeanMetrics, calculatePlatformFee } from '../../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

interface DiscountSimulatorProps {
    beans: Bean[];
    globalSettings: GlobalSettings;
    feeSettings: FeeSettings;
}

export const DiscountSimulator: React.FC<DiscountSimulatorProps> = ({ beans, globalSettings, feeSettings }) => {
    const { t } = useLanguage();
    const [selectedBeanId, setSelectedBeanId] = useState<string>(beans[0]?.id || '');
    const [bigBagG, setBigBagG] = useState<number>(200);
    const [discountRate, setDiscountRate] = useState<number>(0); // %

    const selectedBean = beans.find(b => b.id === selectedBeanId) || beans[0];
    if (!selectedBean) return null;

    // Calculate metrics
    const baseMetrics = calculateBeanMetrics(selectedBean, globalSettings, feeSettings);
    if (!baseMetrics) return null;

    const baseRetailPricePerG = baseMetrics.retailPrice / globalSettings.salesUnitG;

    // Scaled Price
    const scaledPriceRaw = baseRetailPricePerG * bigBagG;
    const discountedPriceRaw = scaledPriceRaw * (1 - discountRate / 100);
    const finalPrice = Math.ceil(discountedPriceRaw / 10) * 10;

    // Cost
    const baseCostPerG = baseMetrics.costPerBag / globalSettings.salesUnitG;
    const bagCost = baseCostPerG * bigBagG;

    // Fee 
    const fee = calculatePlatformFee(finalPrice, feeSettings);

    // Shipping (Only applies online usually, but we trust settings)
    const shipping = feeSettings.saleType === 'ONLINE' ? feeSettings.shippingCost : 0;

    const profit = finalPrice - bagCost - fee - shipping;
    const genkaRate = finalPrice > 0 ? (bagCost / finalPrice * 100) : 100;

    // Chart Data
    const data = [];
    for (let d = 0; d <= 50; d += 5) {
        const pRaw = scaledPriceRaw * (1 - d / 100);
        const pFinal = Math.ceil(pRaw / 10) * 10;
        const f = calculatePlatformFee(pFinal, feeSettings);
        const prof = pFinal - bagCost - f - shipping;
        data.push({ discount: d, profit: prof });
    }

    // Label for Fee
    const getFeeLabel = () => {
        if (feeSettings.saleType === 'ONLINE') {
            return t.feeSimulator.plans[feeSettings.platformType];
        } else {
            return t.feeSimulator.paymentMethods[feeSettings.paymentMethod];
        }
    };

    return (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-8">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                📉 {t.discountSimulator.title}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                    {/* Inputs */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.discountSimulator.targetBean}</label>
                        <select
                            className="w-full p-2 rounded border border-slate-300"
                            value={selectedBeanId}
                            onChange={(e) => setSelectedBeanId(e.target.value)}
                        >
                            {beans.map(b => (
                                <option key={b.id} value={b.id}>{b.name || 'Unnamed Bean'}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.discountSimulator.bagSize}</label>
                        <input
                            type="range" min="100" max="1000" step="100"
                            value={bigBagG}
                            onChange={(e) => setBigBagG(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-right text-sm font-medium">{bigBagG} {t.common.unitG}</div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.discountSimulator.discountRate}</label>
                        <input
                            type="range" min="0" max="50" step="1"
                            value={discountRate}
                            onChange={(e) => setDiscountRate(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-right text-sm font-medium text-red-500">{discountRate}% OFF</div>
                    </div>
                </div>

                {/* Result Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                    <div className="text-center">
                        <div className="text-sm text-slate-500 mb-1">{t.discountSimulator.sellingPrice}</div>
                        <div className="text-4xl font-black text-slate-900 mb-4">¥ {finalPrice.toLocaleString()}</div>

                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${profit > 0 ? (genkaRate <= selectedBean.targetRateWholesale ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') : 'bg-red-100 text-red-800'
                            }`}>
                            {profit > 0 ? (genkaRate <= selectedBean.targetRateWholesale ? t.profitAnalysis.badges.safe : t.profitAnalysis.badges.warning) : t.profitAnalysis.badges.danger}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-100 pt-4">
                            <div>
                                <div className="text-xs text-slate-400">{t.discountSimulator.profit}</div>
                                <div className="font-bold text-slate-700">¥ {Math.floor(profit).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">{t.discountSimulator.costRate}</div>
                                <div className="font-bold text-slate-700">{genkaRate.toFixed(1)}%</div>
                            </div>
                        </div>

                        {/* Fee Detail */}
                        <div className="mt-4 pt-2 border-t border-slate-100 text-xs text-slate-400 text-left">
                            Fee ({getFeeLabel()}): ¥{fee.toLocaleString()}
                            {shipping > 0 && <span> <br /> Shipping: ¥{shipping.toLocaleString()}</span>}
                        </div>
                    </div>
                </div>

                {/* Simple Chart */}
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="discount" label={{ value: t.discountSimulator.chart.xAxis, position: 'insideBottom', offset: -5 }} />
                            <YAxis />
                            <Tooltip formatter={(val: number) => `¥ ${val.toLocaleString()}`} />
                            <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
