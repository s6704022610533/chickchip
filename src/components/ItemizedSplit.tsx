import React, { useState } from 'react';
import { BillItem, Person, BillState } from '../types';
import { formatCurrency } from '../utils/calculator';
import { Plus, Trash2, Check, Users, Utensils, HelpCircle } from 'lucide-react';

interface ItemizedSplitProps {
  items: BillItem[];
  people: Person[];
  feeDistribution: BillState['feeDistribution'];
  onItemsChange: (items: BillItem[]) => void;
  onFeeDistributionChange: (distribution: BillState['feeDistribution']) => void;
}

export const ItemizedSplit: React.FC<ItemizedSplitProps> = ({
  items,
  people,
  feeDistribution,
  onItemsChange,
  onFeeDistributionChange,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price < 0) return;

    const newItem: BillItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newItemName.trim() || `รายการที่ ${items.length + 1}`,
      price: price,
      quantity: parseInt(newItemQty) || 1,
      assignedPersonIds: people.map((p) => p.id), // Default to everyone
    };

    onItemsChange([...items, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQty('1');
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<BillItem>) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const togglePersonForItem = (itemId: string, personId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const currentAssigned = item.assignedPersonIds || [];
    let updated: string[];

    if (currentAssigned.includes(personId)) {
      updated = currentAssigned.filter((id) => id !== personId);
    } else {
      updated = [...currentAssigned, personId];
    }

    handleUpdateItem(itemId, { assignedPersonIds: updated });
  };

  const selectAllForProduct = (itemId: string) => {
    handleUpdateItem(itemId, { assignedPersonIds: people.map((p) => p.id) });
  };

  const clearAllForProduct = (itemId: string) => {
    handleUpdateItem(itemId, { assignedPersonIds: [] });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>รายการอาหาร / สินค้าในบิล ({items.length} รายการ)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            เพิ่มรายการและแตะเลือกชื่อเพื่อนที่ร่วมทานในแต่ละจาน
          </p>
        </div>

        {/* Fee Distribution Strategy Switch */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
          <span className="text-[11px] text-slate-500 pl-1 hidden sm:inline">วิธีแบ่ง VAT/SC:</span>
          <button
            type="button"
            onClick={() => onFeeDistributionChange('PROPORTIONAL')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              feeDistribution === 'PROPORTIONAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="คนที่สั่งเยอะ รับผิดชอบ VAT/SC ตามสัดส่วนยอดที่สั่ง"
          >
            ตามสัดส่วนยอดสั่ง (แนะนำ)
          </button>
          <button
            type="button"
            onClick={() => onFeeDistributionChange('EQUAL')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              feeDistribution === 'EQUAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="หารค่า VAT/SC เท่ากันทุกคนเท่าๆ กัน"
          >
            หารเท่าทุกคน
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="text-xs font-bold text-slate-700">เพิ่มรายการใหม่</div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-6">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="ชื่อรายการ เช่น ต้มยำกุ้ง, ส้มตำ"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="text-[10.5px] text-slate-400 mt-0.5 block">ใส่ชื่ออาหารหรือเครื่องดื่ม</span>
          </div>

          <div className="sm:col-span-3">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">฿</span>
              <input
                type="number"
                min="0"
                step="any"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="ราคาต่อหน่วย"
                required
                className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <span className="text-[10.5px] text-slate-400 mt-0.5 block">ราคาต่อจาน (บาท)</span>
          </div>

          <div className="sm:col-span-1">
            <input
              type="number"
              min="1"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              placeholder="จำนวน"
              className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 text-center font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="text-[10.5px] text-slate-400 mt-0.5 block text-center">จำนวน</span>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มเมนู</span>
            </button>
          </div>
        </div>
      </form>

      {/* Item List */}
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">ยังไม่มีรายการอาหาร</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              กรอกฟอร์มด้านบนเพื่อเพิ่มรายการและระบุคนที่แชร์จานนั้น
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            const assignedCount = (item.assignedPersonIds || []).length;
            const portionPrice = assignedCount > 0 ? itemTotal / assignedCount : itemTotal / people.length;

            return (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none py-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400">฿</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-right font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-400">×</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) => handleUpdateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                        className="w-10 px-1 py-0.5 bg-white border border-slate-200 rounded text-center font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-400">=</span>
                      <span className="font-bold text-emerald-800 text-xs sm:text-sm">
                        ฿{formatCurrency(itemTotal)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* People Assignment Picker */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>คนที่แชร์จานนี้:</span>
                    <button
                      type="button"
                      onClick={() => selectAllForProduct(item.id)}
                      className="text-emerald-700 hover:underline font-medium cursor-pointer"
                    >
                      ทุกคน
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => clearAllForProduct(item.id)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      ล้าง
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {people.map((person) => {
                      const isAssigned = (item.assignedPersonIds || []).includes(person.id);
                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => togglePersonForItem(item.id, person.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all cursor-pointer border ${
                            isAssigned
                              ? 'bg-white border-emerald-500 text-slate-900 shadow-2xs font-semibold'
                              : 'bg-slate-100 border-transparent text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: person.color }}
                          />
                          <span>{person.name}</span>
                          {isAssigned && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Breakdown per person calculation */}
                <div className="text-[11px] text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span>
                    แชร์ {assignedCount > 0 ? `${assignedCount} คน` : `ทุกคน (${people.length} คน)`}
                  </span>
                  <span className="font-semibold text-slate-700">
                    เฉลี่ยคนละ ฿{formatCurrency(portionPrice)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
