import React from 'react';
import { SetProduct } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { NumberInput } from '../ui/NumberInput';
import { Settings } from 'lucide-react';

interface SetProductSettingsProps {
    product: SetProduct;
    onUpdateProduct: (updates: Partial<SetProduct>) => void;
}

export const SetProductSettings: React.FC<SetProductSettingsProps> = ({
    product,
    onUpdateProduct
}) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            {/* Overheads and Fees Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                {/* Overheads */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Settings size={18} />
                        {t.setProduct.overheads.title}
                    </h3>
                    <div className="space-y-4">
                        {/* Loss Settings */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3 space-y-3">
                            <h4 className="text-xs font-semibold text-slate-500">{t.setProduct.loss?.title || 'Loss Settings'}</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.loss?.roastLoss || 'Roast Loss'}</label>
                                    <div className="relative">
                                        <NumberInput
                                            className="w-full p-2 pr-6 text-sm border border-slate-200 rounded-md"
                                            value={product.roastLossRate || 0}
                                            onChange={(v) => onUpdateProduct({ roastLossRate: v })}
                                            step={1}
                                        />
                                        <span className="absolute right-2 top-2 text-slate-400 text-xs">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.loss?.handpickLoss || 'Handpick Loss'}</label>
                                    <div className="relative">
                                        <NumberInput
                                            className="w-full p-2 pr-6 text-sm border border-slate-200 rounded-md"
                                            value={product.handpickLossRate || 0}
                                            onChange={(v) => onUpdateProduct({ handpickLossRate: v })}
                                            step={1}
                                        />
                                        <span className="absolute right-2 top-2 text-slate-400 text-xs">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.overheads.packaging}</label>
                            <NumberInput
                                className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                value={product.packagingCost || 0}
                                onChange={(v) => onUpdateProduct({ packagingCost: v })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.overheads.utility}</label>
                            <NumberInput
                                className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                value={product.utilityCost || 0}
                                onChange={(v) => onUpdateProduct({ utilityCost: v })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.overheads.shipping}</label>
                            <NumberInput
                                className="w-full p-2 text-sm border border-slate-200 rounded-md"
                                value={product.shippingCost || 0}
                                onChange={(v) => onUpdateProduct({ shippingCost: v })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.overheads.taxRate}</label>
                            <div className="relative">
                                <NumberInput
                                    className="w-full p-2 pr-8 text-sm border border-slate-200 rounded-md"
                                    value={product.taxRate || 0}
                                    onChange={(v) => onUpdateProduct({ taxRate: v })}
                                    step={1}
                                />
                                <span className="absolute right-3 top-2 text-slate-400 text-xs">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fees */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <span className="text-lg">💳</span>
                        {t.setProduct.fees.title}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.fees.platform}</label>
                            <select
                                className="w-full p-2 text-sm border border-slate-200 rounded-md bg-white"
                                value={product.platformName || 'Custom'}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    let rate = product.platformFeeRate || 0;
                                    let fixed = product.platformFeeFixed || 0;
                                    if (name === 'BASE') { rate = 6.6; fixed = 40; }
                                    if (name === 'Shopify') { rate = 3.4; fixed = 0; }
                                    if (name === 'Stores') { rate = 5.0; fixed = 0; }
                                    onUpdateProduct({ platformName: name, platformFeeRate: rate, platformFeeFixed: fixed });
                                }}
                            >
                                <option value="Custom">Custom</option>
                                <option value="BASE">BASE (Standard)</option>
                                <option value="Shopify">Shopify</option>
                                <option value="Stores">STORES</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.fees.platformFeeRate}</label>
                                <div className="relative">
                                    <NumberInput
                                        className="w-full p-2 pr-8 text-sm border border-slate-200 rounded-md"
                                        value={product.platformFeeRate || 0}
                                        onChange={(v) => onUpdateProduct({ platformFeeRate: v })}
                                        step={0.1}
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400 text-xs">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">{t.setProduct.fees.platformFeeFixed || 'Fixed Fee'}</label>
                                <div className="relative">
                                    <NumberInput
                                        className="w-full p-2 pr-8 text-sm border border-slate-200 rounded-md"
                                        value={product.platformFeeFixed || 0}
                                        onChange={(v) => onUpdateProduct({ platformFeeFixed: v })}
                                        step={1}
                                    />
                                    <span className="absolute right-3 top-2 text-slate-400 text-xs">¥</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
