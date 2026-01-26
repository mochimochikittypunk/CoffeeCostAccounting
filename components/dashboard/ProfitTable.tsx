'use client';

import React from 'react';
import { SimulationResult } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProfitTableProps {
    results: SimulationResult[];
    unitG: number;
}

export const ProfitTable: React.FC<ProfitTableProps> = ({ results, unitG }) => {
    const { t } = useLanguage();

    if (results.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-sm">Please enter bean details to see analysis</p>
            </div>
        );
    }

    const tableHeaders = [
        t.profitAnalysis.table.name,
        t.profitAnalysis.table.retailPrice,
        t.profitAnalysis.table.wholesalePrice,
        t.profitAnalysis.table.profitPerBag,
        t.profitAnalysis.table.costPerBag,
        t.profitAnalysis.table.sellableUnits,
        t.profitAnalysis.table.breakeven,
    ];

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {tableHeaders.map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {results.map((r) => {
                        const beanName = (r as any).beanName || r.beanId;

                        return (
                            <tr key={r.beanId} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 border-l-4 border-l-transparent hover:border-l-blue-500">
                                    {beanName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                                    ¥ {r.retailPrice.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    ¥ {r.wholesalePrice.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-bold">
                                    ¥ {r.profitPerBag.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    ¥ {r.costPerBag.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {r.sellableUnits.toLocaleString()} {t.common.unitBags}
                                    <span className="text-xs text-slate-400 ml-1">({unitG}{t.common.unitG})</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs">
                                    <span className={`px-2 py-1 rounded-full font-medium ${r.breakevenUnits > r.sellableUnits
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {r.breakevenUnits} {t.common.unitBags}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
