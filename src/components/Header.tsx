import React from 'react';
import { Calculator, RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onLoadSample }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Calculator className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              หารบิล (Bill Splitter)
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              คำนวณยอดบิล VAT & Service Charge เป๊ะทุกสตางค์
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onLoadSample}
            id="btn-load-sample"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
            title="โหลดตัวอย่างบิลร้านอาหาร"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">โหลด</span>ตัวอย่าง
          </button>

          <button
            type="button"
            onClick={onReset}
            id="btn-reset-bill"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200"
            title="ล้างข้อมูลทั้งหมด"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
