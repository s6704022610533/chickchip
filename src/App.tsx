import React, { useState, useMemo } from 'react';
import { BillState, SplitMode, Person, BillItem } from './types';
import { calculateBill } from './utils/calculator';
import { Header } from './components/Header';
import { BillSummaryCard } from './components/BillSummaryCard';
import { BillDetailsInput } from './components/BillDetailsInput';
import { PeopleManager } from './components/PeopleManager';
import { SplitModeSelector } from './components/SplitModeSelector';
import { ItemizedSplit } from './components/ItemizedSplit';
import { CustomSplit } from './components/CustomSplit';
import { ResultSection } from './components/ResultSection';
import { PromptPayModal } from './components/PromptPayModal';

const DEFAULT_PEOPLE: Person[] = [
  { id: 'p1', name: 'คุณ A', color: '#059669', customShares: 1, customAmount: 0 },
  { id: 'p2', name: 'คุณ B', color: '#2563EB', customShares: 1, customAmount: 0 },
  { id: 'p3', name: 'คุณ C', color: '#D97706', customShares: 1, customAmount: 0 },
];

const DEFAULT_ITEMS: BillItem[] = [
  { id: 'item-1', name: 'ปลากะพงทอดน้ำปลา', price: 420, quantity: 1, assignedPersonIds: ['p1', 'p2', 'p3'] },
  { id: 'item-2', name: 'ต้มยำกุ้งน้ำข้น', price: 280, quantity: 1, assignedPersonIds: ['p1', 'p2', 'p3'] },
  { id: 'item-3', name: 'ชาเขียวเย็น', price: 65, quantity: 2, assignedPersonIds: ['p1', 'p2'] },
  { id: 'item-4', name: 'กาแฟอเมริกาโน่', price: 75, quantity: 1, assignedPersonIds: ['p3'] },
];

const INITIAL_BILL: BillState = {
  title: 'มื้อเย็นร้านอาหาร',
  subtotalMode: 'AUTO',
  manualSubtotal: 905,
  discount: { enabled: true, type: 'PERCENT', value: 10 },
  serviceCharge: { enabled: true, type: 'PERCENT', value: 10 },
  vat: { enabled: true, type: 'PERCENT', value: 7 },
  vatAppliedOnServiceCharge: true,
  feeDistribution: 'PROPORTIONAL',
  people: DEFAULT_PEOPLE,
  items: DEFAULT_ITEMS,
  splitMode: 'ITEMIZED',
  promptPayId: '0812345678',
  promptPayName: 'นายพร้อมเพย์ ตัวอย่าง',
};

export default function App() {
  const [bill, setBill] = useState<BillState>(INITIAL_BILL);
  const [promptPayModal, setPromptPayModal] = useState<{
    isOpen: boolean;
    targetPersonName?: string;
    amount: number;
  }>({
    isOpen: false,
    amount: 0,
  });

  // Calculate Subtotal from items
  const calculatedItemSubtotal = useMemo(() => {
    return bill.items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }, [bill.items]);

  // Real-time calculation on any state modification
  const calculationResult = useMemo(() => {
    return calculateBill(bill);
  }, [bill]);

  const updateBill = (updates: Partial<BillState>) => {
    setBill((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setBill({
      title: '',
      subtotalMode: 'MANUAL',
      manualSubtotal: 0,
      discount: { enabled: false, type: 'PERCENT', value: 0 },
      serviceCharge: { enabled: false, type: 'PERCENT', value: 10 },
      vat: { enabled: true, type: 'PERCENT', value: 7 },
      vatAppliedOnServiceCharge: true,
      feeDistribution: 'PROPORTIONAL',
      people: [
        { id: 'p1', name: 'คนที่ 1', color: '#059669', customShares: 1 },
        { id: 'p2', name: 'คนที่ 2', color: '#2563EB', customShares: 1 },
      ],
      items: [],
      splitMode: 'EQUAL',
      promptPayId: bill.promptPayId,
      promptPayName: bill.promptPayName,
    });
  };

  const handleLoadSample = () => {
    setBill(INITIAL_BILL);
  };

  const handleSavePromptPay = (id: string, name?: string) => {
    updateBill({ promptPayId: id, promptPayName: name });
  };

  const openPromptPayModal = (personName?: string, amount?: number) => {
    setPromptPayModal({
      isOpen: true,
      targetPersonName: personName,
      amount: amount ?? calculationResult.grandTotal,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Navigation */}
      <Header onReset={handleReset} onLoadSample={handleLoadSample} />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-4 py-4 sm:py-6 space-y-4 pb-20">
        {/* Bill Summary Hero Card */}
        <BillSummaryCard
          result={calculationResult}
          peopleCount={bill.people.length}
        />

        {/* Section 1: Bill & Tax/Service Charge Settings */}
        <BillDetailsInput
          bill={bill}
          onChange={updateBill}
          calculatedItemSubtotal={calculatedItemSubtotal}
        />

        {/* Section 2: People Management */}
        <PeopleManager
          people={bill.people}
          onChange={(people) => updateBill({ people })}
        />

        {/* Section 3: Split Mode Selector */}
        <SplitModeSelector
          currentMode={bill.splitMode}
          onChange={(splitMode) => updateBill({ splitMode })}
        />

        {/* Dynamic Split Mode Content */}
        {bill.splitMode === 'ITEMIZED' && (
          <ItemizedSplit
            items={bill.items}
            people={bill.people}
            feeDistribution={bill.feeDistribution}
            onItemsChange={(items) => updateBill({ items })}
            onFeeDistributionChange={(feeDistribution) => updateBill({ feeDistribution })}
          />
        )}

        {bill.splitMode === 'CUSTOM' && (
          <CustomSplit
            people={bill.people}
            result={calculationResult}
            onPeopleChange={(people) => updateBill({ people })}
          />
        )}

        {/* Section 4: Real-time Result & Breakdown */}
        <ResultSection
          bill={bill}
          result={calculationResult}
          onOpenPromptPay={openPromptPayModal}
        />
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <p className="font-medium text-slate-600">
            Bill Splitter • เครื่องมือคำนวณและหารบิลแม่นยำ
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            รองรับ VAT 7%, Service Charge, ส่วนลด และกระจายเศษสตางค์ลงตัว 100%
          </p>
        </div>
      </footer>

      {/* PromptPay QR Code Modal */}
      <PromptPayModal
        isOpen={promptPayModal.isOpen}
        onClose={() => setPromptPayModal((prev) => ({ ...prev, isOpen: false }))}
        targetPersonName={promptPayModal.targetPersonName}
        amount={promptPayModal.amount}
        promptPayId={bill.promptPayId || ''}
        promptPayName={bill.promptPayName || ''}
        onSavePromptPayId={handleSavePromptPay}
      />
    </div>
  );
}
