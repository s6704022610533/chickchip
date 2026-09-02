import React from 'react';
import { BillState } from '../types';
import { Percent, DollarSign, HelpCircle, Check, Info } from 'lucide-react';

interface BillDetailsInputProps {
  bill: BillState;
  onChange: (updated: Partial<BillState>) => void;
  calculatedItemSubtotal: number;
}

export const BillDetailsInput: React.FC<BillDetailsInputProps> = ({
  bill,
  onChange,
  calculatedItemSubtotal,
}) => {
  const updateDiscount = (changes: Partial<BillState['discount']>) => {
    onChange({ discount: { ...bill.discount, ...changes } });
  };

  const updateServiceCharge = (changes: Partial<BillState['serviceCharge']>) => {
    onChange({ serviceCharge: { ...bill.serviceCharge, ...changes } });
  };

  const updateVat = (changes: Partial<BillState['vat']>) => {
    onChange({ vat: { ...bill.vat, ...changes } });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <span>1. ข้อมูลยอดบิล & ภาษี / ค่าบริการ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กรอกยอดเงินและตั้งค่าส่วนลด Service Charge ภาษีมูลค่าเพิ่ม
          </p>
        </div>
      </div>

      {/* Bill Title Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-bill-title">
          ชื่อบิล / ร้านอาหาร (ไม่บังคับ)
        </label>
        <input
          id="input-bill-title"
          type="text"
          value={bill.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="เช่น มื้อเย็น MK สยาม, คาเฟ่ อารีย์"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <span className="text-[11px] text-slate-400 mt-1 block">
          ใส่เพื่อบันทึกหรือคัดลอกส่งให้เพื่อนในแชท
        </span>
      </div>

      {/* Subtotal Input Section */}
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="input-subtotal">
            ยอดรวมค่าอาหาร / สินค้า (ก่อนภาษีและบริการ)
            <span className="text-rose-500">*</span>
          </label>

          {/* Subtotal Mode Switch */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onChange({ subtotalMode: 'AUTO' })}
              className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${
                bill.subtotalMode === 'AUTO'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รวมจากรายการย่อย ({calculatedItemSubtotal.toLocaleString()} ฿)
            </button>
            <button
              type="button"
              onClick={() => onChange({ subtotalMode: 'MANUAL' })}
              className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${
                bill.subtotalMode === 'MANUAL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กรอกยอดเอง
            </button>
          </div>
        </div>

        {bill.subtotalMode === 'MANUAL' ? (
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                ฿
              </span>
              <input
                id="input-subtotal"
                type="number"
                min="0"
                step="any"
                value={bill.manualSubtotal === 0 ? '' : bill.manualSubtotal}
                onChange={(e) => onChange({ manualSubtotal: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              <span>คำอธิบาย: ยอดรวมราคาอาหารทั้งหมดในใบเสร็จก่อนบวกค่าบริการและภาษี (เช่น 1250)</span>
            </p>
          </div>
        ) : (
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">ยอดรวมคำนวณจาก {bill.items.length} รายการ:</span>
            <span className="text-sm font-bold text-emerald-700">
              ฿{calculatedItemSubtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Grid of Fees: Discount, Service Charge, VAT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Discount Card */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <input
                id="check-discount"
                type="checkbox"
                checked={bill.discount.enabled}
                onChange={(e) => updateDiscount({ enabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="check-discount" className="text-xs font-bold text-slate-800 cursor-pointer">
                ส่วนลด (Discount)
              </label>
            </div>

            {bill.discount.enabled && (
              <div className="flex items-center bg-white rounded-md border border-slate-200 text-[11px] p-0.5">
                <button
                  type="button"
                  onClick={() => updateDiscount({ type: 'PERCENT' })}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    bill.discount.type === 'PERCENT' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => updateDiscount({ type: 'FIXED' })}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    bill.discount.type === 'FIXED' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  ฿
                </button>
              </div>
            )}
          </div>

          {bill.discount.enabled && (
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="input-discount-val"
                  type="number"
                  min="0"
                  step="any"
                  value={bill.discount.value || ''}
                  onChange={(e) => updateDiscount({ value: parseFloat(e.target.value) || 0 })}
                  placeholder={bill.discount.type === 'PERCENT' ? 'เช่น 10%' : 'เช่น 100 บาท'}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  {bill.discount.type === 'PERCENT' ? '%' : 'บาท'}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-tight">
                คำอธิบาย: ส่วนลดจากร้าน เช่น ลด 10% หรือคูปอง 100 บาท
              </p>
            </div>
          )}
        </div>

        {/* Service Charge Card */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <input
                id="check-service-charge"
                type="checkbox"
                checked={bill.serviceCharge.enabled}
                onChange={(e) => updateServiceCharge({ enabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="check-service-charge" className="text-xs font-bold text-slate-800 cursor-pointer">
                ค่าบริการ (Service Charge)
              </label>
            </div>

            {bill.serviceCharge.enabled && (
              <div className="flex items-center bg-white rounded-md border border-slate-200 text-[11px] p-0.5">
                <button
                  type="button"
                  onClick={() => updateServiceCharge({ type: 'PERCENT' })}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    bill.serviceCharge.type === 'PERCENT' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => updateServiceCharge({ type: 'FIXED' })}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    bill.serviceCharge.type === 'FIXED' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  ฿
                </button>
              </div>
            )}
          </div>

          {bill.serviceCharge.enabled && (
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="input-sc-val"
                  type="number"
                  min="0"
                  step="any"
                  value={bill.serviceCharge.value || ''}
                  onChange={(e) => updateServiceCharge({ value: parseFloat(e.target.value) || 0 })}
                  placeholder="เช่น 10%"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  {bill.serviceCharge.type === 'PERCENT' ? '%' : 'บาท'}
                </span>
              </div>

              {/* Quick Presets for Service Charge */}
              <div className="flex items-center gap-1 text-[10.5px]">
                <span className="text-slate-400">ลัด:</span>
                <button
                  type="button"
                  onClick={() => updateServiceCharge({ type: 'PERCENT', value: 10 })}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                >
                  10% (ทั่วไป)
                </button>
                <button
                  type="button"
                  onClick={() => updateServiceCharge({ type: 'PERCENT', value: 15 })}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                >
                  15%
                </button>
              </div>

              <p className="text-[10.5px] text-slate-500 leading-tight">
                คำอธิบาย: ค่าบริการร้านอาหารส่วนใหญ่ 10% (คิดจากยอดหลังหักส่วนลด)
              </p>
            </div>
          )}
        </div>

        {/* VAT Card */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <input
                id="check-vat"
                type="checkbox"
                checked={bill.vat.enabled}
                onChange={(e) => updateVat({ enabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="check-vat" className="text-xs font-bold text-slate-800 cursor-pointer">
                ภาษีมูลค่าเพิ่ม (VAT 7%)
              </label>
            </div>

            {bill.vat.enabled && (
              <div className="flex items-center bg-white rounded-md border border-slate-200 text-[11px] p-0.5">
                <button
                  type="button"
                  onClick={() => updateVat({ type: 'PERCENT' })}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    bill.vat.type === 'PERCENT' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => updateVat({ type: 'FIXED' })}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    bill.vat.type === 'FIXED' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  ฿
                </button>
              </div>
            )}
          </div>

          {bill.vat.enabled && (
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="input-vat-val"
                  type="number"
                  min="0"
                  step="any"
                  value={bill.vat.value || ''}
                  onChange={(e) => updateVat({ value: parseFloat(e.target.value) || 0 })}
                  placeholder="เช่น 7%"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  {bill.vat.type === 'PERCENT' ? '%' : 'บาท'}
                </span>
              </div>

              {/* Quick Presets for VAT */}
              <div className="flex items-center gap-1 text-[10.5px]">
                <span className="text-slate-400">ลัด:</span>
                <button
                  type="button"
                  onClick={() => updateVat({ type: 'PERCENT', value: 7 })}
                  className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                >
                  7% (มาตรฐาน)
                </button>
              </div>

              <p className="text-[10.5px] text-slate-500 leading-tight">
                คำอธิบาย: ภาษีมูลค่าเพิ่ม 7% ของกรมสรรพากร
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Calculation Options */}
      {bill.vat.enabled && bill.serviceCharge.enabled && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bill.vatAppliedOnServiceCharge}
              onChange={(e) => onChange({ vatAppliedOnServiceCharge: e.target.checked })}
              className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
            />
            <span className="text-[11.5px]">
              คิด VAT รวมบน Service Charge (มาตรฐานร้านอาหาร ++ เช่น 10% + 7%)
            </span>
          </label>
        </div>
      )}
    </div>
  );
};
