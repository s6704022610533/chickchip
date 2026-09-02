import React from 'react';
import { SplitMode } from '../types';
import { Divide, ListChecks, SlidersHorizontal, Check } from 'lucide-react';

interface SplitModeSelectorProps {
  currentMode: SplitMode;
  onChange: (mode: SplitMode) => void;
}

export const SplitModeSelector: React.FC<SplitModeSelectorProps> = ({ currentMode, onChange }) => {
  const modes: {
    id: SplitMode;
    label: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'EQUAL',
      label: 'หารเท่ากัน',
      description: 'ทุกคนจ่ายยอดรวมเท่ากัน เหมาะกับบุฟเฟ่ต์หรือมื้อที่กินร่วมกัน',
      icon: Divide,
    },
    {
      id: 'ITEMIZED',
      label: 'เลือกตามรายการ',
      description: 'ระบุว่าใครสั่งเมนูไหน พร้อมกระจาย VAT/SC ตามสัดส่วน',
      icon: ListChecks,
    },
    {
      id: 'CUSTOM',
      label: 'กำหนดเอง / สัดส่วน',
      description: 'ระบุยอดเงิน หรือ สัดส่วน (Shares) ของแต่ละคนโดยตรง',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
      <div className="pb-2 border-b border-slate-100">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
          <span>3. เลือกรูปแบบการหารบิล (Split Mode)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          เลือกวิธีคำนวณที่เหมาะสมกับมื้อนี้
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                  {mode.label}
                </div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  {mode.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
