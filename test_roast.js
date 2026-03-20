const logs = [];
const monthsData = new Map();
const now = new Date();
for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthsData.set(monthStr, 0);
}
const res = Array.from(monthsData.entries())
    .map(([month, totalKg]) => ({ month, totalKg }))
    .sort((a, b) => b.month.localeCompare(a.month));
console.log(res.length);
