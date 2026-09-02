import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculator';
import { CheckCircle2, AlertCircle, Receipt, Users } from 'lucide-react';

interface BillSummaryCardProps {
  result: CalculationResult;
  peopleCount: number;
}

export const BillSummaryCard: React.FC<BillSummaryCardProps> = ({ result, peopleCount }) => {
  const avgPerPerson = peopleCount > 0 ? result.grandTotal / peopleCount : 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-0.5">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>ยอดรวมสุทธิทั้งบิล (Grand Total)</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ฿{formatCurrency(result.grandTotal)}
            </span>
            <span className="text-xs text-slate-500 font-medium">บาท</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-2 sm:self-center">
          <Users className="w-4 h-4 text-slate-500" />
          <div className="text-right">
            <div className="text-[11px] text-slate-500">เฉลี่ยต่อคน ({peopleCount} คน)</div>
            <div className="text-sm font-bold text-slate-800">
              ฿{formatCurrency(avgPerPerson)}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
        <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
          <span className="text-slate-500 block text-[11px]">ยอดรวมอาหาร/สินค้า</span>
          <span className="font-semibold text-slate-700">฿{formatCurrency(result.subtotal)}</span>
        </div>

        <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
          <span className="text-slate-500 block text-[11px]">ส่วนลด</span>
          <span className={`font-semibold ${result.discountAmount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {result.discountAmount > 0 ? `-฿${formatCurrency(result.discountAmount)}` : '฿0.00'}
          </span>
        </div>

        <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
          <span className="text-slate-500 block text-[11px]">ค่าบริการ (SC)</span>
          <span className={`font-semibold ${result.serviceChargeAmount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
            {result.serviceChargeAmount > 0 ? `+฿${formatCurrency(result.serviceChargeAmount)}` : '฿0.00'}
          </span>
        </div>

        <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
          <span className="text-slate-500 block text-[11px]">ภาษีมูลค่าเพิ่ม (VAT)</span>
          <span className={`font-semibold ${result.vatAmount > 0 ? 'text-indigo-700' : 'text-slate-700'}`}>
            {result.vatAmount > 0 ? `+฿${formatCurrency(result.vatAmount)}` : '฿0.00'}
          </span>
        </div>
      </div>

      {/* Validation status pill */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {result.isExactMatch ? (
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-[11px] border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ยอดรวมตรงเป๊ะ 100% (ผลต่าง 0.00 บาท)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium text-[11px] border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>ผลต่าง {formatCurrency(Math.abs(result.difference))} บาท</span>
            </div>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          ผลรวมคนหาร: <span className="font-semibold text-slate-700">฿{formatCurrency(result.calculatedSum)}</span>
        </div>
      </div>
    </div>
  );
};
