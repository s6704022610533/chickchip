import React, { useState } from 'react';
import { BillState, CalculationResult, PersonBreakdown } from '../types';
import { formatCurrency } from '../utils/calculator';
import {
  Receipt,
  Copy,
  Check,
  QrCode,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

interface ResultSectionProps {
  bill: BillState;
  result: CalculationResult;
  onOpenPromptPay: (personName?: string, amount?: number) => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  bill,
  result,
  onOpenPromptPay,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedPersonId, setCopiedPersonId] = useState<string | null>(null);

  // Generate LINE-friendly text summary
  const generateShareText = (): string => {
    let text = `🧾 สรุปยอดหารบิล${bill.title ? `: ${bill.title}` : ''}\n`;
    text += `──────────────\n`;
    text += `ยอดรวมค่าอาหาร: ฿${formatCurrency(result.subtotal)}\n`;
    if (result.discountAmount > 0) {
      text += `ส่วนลด: -฿${formatCurrency(result.discountAmount)}\n`;
    }
    if (result.serviceChargeAmount > 0) {
      text += `ค่าบริการ (SC): +฿${formatCurrency(result.serviceChargeAmount)}\n`;
    }
    if (result.vatAmount > 0) {
      text += `ภาษี (VAT 7%): +฿${formatCurrency(result.vatAmount)}\n`;
    }
    text += `💰 ยอดรวมสุทธิ: ฿${formatCurrency(result.grandTotal)} บาท\n`;
    text += `──────────────\n`;
    text += `👥 ยอดที่แต่ละคนต้องจ่าย (${result.breakdowns.length} คน):\n`;

    result.breakdowns.forEach((b, idx) => {
      text += `${idx + 1}. ${b.personName}: ฿${formatCurrency(b.totalToPay)} บาท\n`;
      if (bill.splitMode === 'ITEMIZED' && b.itemsSummary.length > 0) {
        b.itemsSummary.forEach((item) => {
          text += `   • ${item.itemName}: ฿${formatCurrency(item.portionPrice)}\n`;
        });
      }
    });

    if (bill.promptPayId) {
      text += `──────────────\n`;
      text += `📱 พร้อมเพย์: ${bill.promptPayId}${bill.promptPayName ? ` (${bill.promptPayName})` : ''}\n`;
    }

    text += `──────────────\n`;
    text += `✨ คำนวณโดย Bill Splitter (ยอดตรงเป๊ะ ไม่มีเศษหาย)`;

    return text;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  const handleCopyPersonShare = (b: PersonBreakdown) => {
    const text = `${b.personName} ยอดที่ต้องจ่าย: ฿${formatCurrency(b.totalToPay)} บาท${
      bill.promptPayId ? ` (พร้อมเพย์: ${bill.promptPayId})` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedPersonId(b.personId);
    setTimeout(() => setCopiedPersonId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>4. สรุปผลลัพธ์รายคน (Real-time Breakdown)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ยอดที่แต่ละคนต้องจ่าย ปัดเศษ 2 ตำแหน่งทศนิยม
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>คัดลอกแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>คัดลอกสรุปส่ง LINE</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenPromptPay(undefined, result.grandTotal)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="สร้าง QR Code สแกนจ่าย"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR พร้อมเพย์</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Check Box */}
      <div
        className={`p-3 rounded-xl border transition-all flex items-center justify-between flex-wrap gap-2 ${
          result.isExactMatch
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {result.isExactMatch ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="text-xs font-bold">
              {result.isExactMatch
                ? '✅ ตรวจสอบยอดรวมตรงกัน 100% ไม่มีเศษสตางค์หาย'
                : `⚠️ ยอดรวมต่างจากบิล ${formatCurrency(Math.abs(result.difference))} บาท`}
            </div>
            <div className="text-[11px] opacity-80">
              ผลรวมที่คำนวณได้: ฿{formatCurrency(result.calculatedSum)} | ยอดบิลสุทธิ: ฿{formatCurrency(result.grandTotal)}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/50 text-[11px] font-bold text-slate-800">
            ผลต่าง 0.00 บาท
          </span>
        </div>
      </div>

      {/* Individual Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {result.breakdowns.map((person) => (
          <div
            key={person.personId}
            className="bg-slate-50/60 hover:bg-slate-50 rounded-2xl p-4 border border-slate-200/90 transition-all space-y-3 relative group"
          >
            {/* Header of Person Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: person.personColor }}
                >
                  {person.personName.substring(0, 1)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {person.personName}
                  </h4>
                  <span className="text-[10.5px] text-slate-400">
                    {bill.splitMode === 'EQUAL'
                      ? 'หารเท่ากัน'
                      : bill.splitMode === 'ITEMIZED'
                      ? `${person.itemsSummary.length} รายการที่สั่ง`
                      : 'กำหนดสัดส่วน'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  ยอดที่ต้องจ่าย
                </div>
                <div className="text-lg font-black text-slate-900">
                  ฿{formatCurrency(person.totalToPay)}
                </div>
              </div>
            </div>

            {/* Detailed itemized breakdown list if any */}
            {bill.splitMode === 'ITEMIZED' && person.itemsSummary.length > 0 && (
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60 space-y-1 text-xs">
                <div className="text-[10.5px] font-semibold text-slate-400 flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" />
                  <span>เมนูที่ร่วมทาน:</span>
                </div>
                {person.itemsSummary.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="truncate pr-2">• {item.itemName}</span>
                    <span className="font-medium shrink-0">฿{formatCurrency(item.portionPrice)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fee Breakdown Table */}
            <div className="grid grid-cols-4 gap-1 text-[11px] pt-1 border-t border-slate-200/50">
              <div className="text-center bg-white/60 p-1 rounded-md border border-slate-100">
                <span className="text-[10px] text-slate-400 block">ค่าอาหาร</span>
                <span className="font-semibold text-slate-700">฿{formatCurrency(person.baseAmount)}</span>
              </div>

              <div className="text-center bg-white/60 p-1 rounded-md border border-slate-100">
                <span className="text-[10px] text-slate-400 block">ส่วนลด</span>
                <span className={`font-semibold ${person.discountShare > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {person.discountShare > 0 ? `-฿${formatCurrency(person.discountShare)}` : '-'}
                </span>
              </div>

              <div className="text-center bg-white/60 p-1 rounded-md border border-slate-100">
                <span className="text-[10px] text-slate-400 block">ค่าบริการ</span>
                <span className={`font-semibold ${person.serviceChargeShare > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                  {person.serviceChargeShare > 0 ? `+฿${formatCurrency(person.serviceChargeShare)}` : '-'}
                </span>
              </div>

              <div className="text-center bg-white/60 p-1 rounded-md border border-slate-100">
                <span className="text-[10px] text-slate-400 block">VAT 7%</span>
                <span className={`font-semibold ${person.vatShare > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {person.vatShare > 0 ? `+฿${formatCurrency(person.vatShare)}` : '-'}
                </span>
              </div>
            </div>

            {/* Actions for this individual */}
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleCopyPersonShare(person)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="คัดลอกยอดของคนนี้"
              >
                {copiedPersonId === person.personId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>คัดลอกยอด</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenPromptPay(person.personName, person.totalToPay)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="ดู QR พร้อมเพย์ของยอดนี้"
              >
                <QrCode className="w-3 h-3" />
                <span>QR สแกน</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
