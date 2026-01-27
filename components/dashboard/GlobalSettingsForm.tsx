'use client';

import React from 'react';
import { GlobalSettings } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { NumberInput } from '../ui/NumberInput';

interface GlobalSettingsFormProps {
    settings: GlobalSettings;
    onChange: (newSettings: GlobalSettings) => void;
}

export const GlobalSettingsForm: React.FC<GlobalSettingsFormProps> = ({ settings, onChange }) => {
    const { t } = useLanguage();

    const handleChange = (field: keyof GlobalSettings, value: number | boolean) => {
        onChange({ ...settings, [field]: value });
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span>⚙️</span> {t.globalSettings.title}
            </h3>

            <div className="space-y-3">
                {/* Sales Unit */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                        {t.globalSettings.salesUnit}
                    </label>
                    <NumberInput
                        value={settings.salesUnitG}
                        onChange={(v) => handleChange('salesUnitG', v)}
                        className="w-full text-sm p-2 border border-slate-200 rounded-md text-slate-900"
                        step={10}
                        min={10}
                    />
                </div>

                {/* Roast Loss */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                        {t.globalSettings.roastLoss}
                    </label>
                    <div className="relative">
                        <select
                            value={settings.roastLossRate}
                            onChange={(e) => handleChange('roastLossRate', Number(e.target.value))}
                            className="w-full text-sm p-2 border border-slate-200 rounded-md text-slate-900 appearance-none bg-white"
                        >
                            <option value={10}>{t.globalSettings.roastOptions.light}</option>
                            <option value={15}>{t.globalSettings.roastOptions.medium}</option>
                            <option value={20}>{t.globalSettings.roastOptions.dark}</option>
                            {/* Keep option for custom if current value matches none? 
                                User asked for specific checklist, so let's stick to these. 
                                But if user had custom value, we should probably support it or it will reset.
                                For now, let's just force these 3 options as requested.
                             */}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Handpick Loss */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                        {t.globalSettings.handpickLoss}
                    </label>
                    <NumberInput
                        value={settings.handpickLossRate}
                        onChange={(v) => handleChange('handpickLossRate', v)}
                        className="w-full text-sm p-2 border border-slate-200 rounded-md text-slate-900"
                    />
                </div>

                {/* Utility Cost */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                        {t.globalSettings.utilityCost}
                    </label>
                    <NumberInput
                        value={settings.utilityCostPerRoast}
                        onChange={(v) => handleChange('utilityCostPerRoast', v)}
                        className="w-full text-sm p-2 border border-slate-200 rounded-md text-slate-900"
                        step={10}
                    />
                </div>

                {/* Packaging Cost */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                        {t.globalSettings.packagingCost}
                    </label>
                    <NumberInput
                        value={settings.packagingCost || 0}
                        onChange={(v) => handleChange('packagingCost', v)}
                        className="w-full text-sm p-2 border border-slate-200 rounded-md text-slate-900"
                        step={1}
                        placeholder="0"
                    />
                </div>

                <div className="border-t border-slate-100 pt-3">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{t.globalSettings.taxSettings}</label>

                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-600">{t.globalSettings.isTaxable}</span>
                        <button
                            onClick={() => handleChange('isTaxableEntity', !settings.isTaxableEntity)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${settings.isTaxableEntity ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.isTaxableEntity ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                    </div>

                    {/* Only show tax rate if taxable? Or always show? Always show for clarity, users might change logic */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            {t.globalSettings.taxRate}
                        </label>
                        <NumberInput
                            value={settings.taxRate}
                            onChange={(v) => handleChange('taxRate', v)}
                            className="w-full text-sm p-2 border border-slate-200 rounded-md text-slate-900"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
