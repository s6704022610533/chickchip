import React, { useState } from 'react';
import { Person, CalculationResult } from '../types';
import { formatCurrency, round2 } from '../utils/calculator';
import { SlidersHorizontal, Scale, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomSplitProps {
  people: Person[];
  result: CalculationResult;
  onPeopleChange: (people: Person[]) => void;
}

export const CustomSplit: React.FC<CustomSplitProps> = ({ people, result, onPeopleChange }) => {
  const [customType, setCustomType] = useState<'AMOUNT' | 'SHARES'>('SHARES');

  const handleUpdateAmount = (id: string, amount: number) => {
    onPeopleChange(
      people.map((p) => (p.id === id ? { ...p, customAmount: Math.max(0, amount) } : p))
    );
  };

  const handleUpdateShares = (id: string, shares: number) => {
    onPeopleChange(
      people.map((p) => (p.id === id ? { ...p, customShares: Math.max(0, shares) } : p))
    );
  };

  const setAllEqualShares = () => {
    onPeopleChange(people.map((p) => ({ ...p, customShares: 1, customAmount: undefined })));
  };

  const autoDistributeAmounts = () => {
    const avg = round2(result.grandTotal / Math.max(people.length, 1));
    onPeopleChange(people.map((p) => ({ ...p, customAmount: avg })));
  };

  const totalAssignedAmount = people.reduce((sum, p) => sum + (p.customAmount || 0), 0);
  const remainingAmount = round2(result.grandTotal - totalAssignedAmount);
  const totalShares = people.reduce((sum, p) => sum + (p.customShares || 1), 0);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>กำหนดสัดส่วนหรือยอดเงินเอง (Custom Split)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบุสัดส่วนการหาร (Shares) หรือกรอกจำนวนเงินที่แต่ละคนต้องจ่ายโดยตรง
          </p>
        </div>

        {/* Custom Type Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => {
              setCustomType('SHARES');
              setAllEqualShares();
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              customType === 'SHARES'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            หารตามสัดส่วน (Shares)
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomType('AMOUNT');
              if (!people.some((p) => (p.customAmount ?? 0) > 0)) {
                autoDistributeAmounts();
              }
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              customType === 'AMOUNT'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            กรอกยอดเงิน (บาท)
          </button>
        </div>
      </div>

      {customType === 'SHARES' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <span>รวมทั้งหมด: <strong className="text-slate-900">{totalShares} ส่วน</strong></span>
            <button
              type="button"
              onClick={setAllEqualShares}
              className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>รีเซ็ตเป็นคนละ 1 ส่วนเท่ากัน</span>
            </button>
          </div>

          <div className="space-y-2">
            {people.map((person) => {
              const shares = person.customShares ?? 1;
              const ratio = totalShares > 0 ? shares / totalShares : 1 / people.length;
              const calculatedShare = round2(result.grandTotal * ratio);

              return (
                <div
                  key={person.id}
                  className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                      style={{ backgroundColor: person.color }}
                    >
                      {person.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{person.name}</div>
                      <div className="text-[11px] text-slate-400">
                        สัดส่วน {(ratio * 100).toFixed(1)}% ของบิล
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={shares}
                        onChange={(e) => handleUpdateShares(person.id, parseFloat(e.target.value) || 0)}
                        className="w-12 text-center text-xs font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 font-medium">ส่วน</span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                        ฿{formatCurrency(calculatedShare)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs p-2.5 rounded-xl border bg-slate-50 border-slate-200/70">
            <div>
              <span className="text-slate-500">ยอดที่จัดสรรแล้ว: </span>
              <strong className="text-slate-900">฿{formatCurrency(totalAssignedAmount)}</strong>
              <span className="text-slate-400"> / ฿{formatCurrency(result.grandTotal)}</span>
            </div>
            {Math.abs(remainingAmount) < 0.01 ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ยอดครบพอดี</span>
              </span>
            ) : remainingAmount > 0 ? (
              <span className="text-amber-700 font-semibold text-[11px]">
                ยังเหลือ ฿{formatCurrency(remainingAmount)}
              </span>
            ) : (
              <span className="text-rose-600 font-semibold text-[11px]">
                เกินบิล ฿{formatCurrency(Math.abs(remainingAmount))}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {people.map((person) => {
              const amount = person.customAmount ?? 0;

              return (
                <div
                  key={person.id}
                  className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                      style={{ backgroundColor: person.color }}
                    >
                      {person.name.substring(0, 1)}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{person.name}</div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-400 font-medium">฿</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amount === 0 ? '' : amount}
                      onChange={(e) => handleUpdateAmount(person.id, parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-24 text-right text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
