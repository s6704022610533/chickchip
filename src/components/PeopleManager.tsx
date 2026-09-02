import React, { useState } from 'react';
import { Person } from '../types';
import { Users, Plus, X, UserPlus, Sparkles } from 'lucide-react';

const PRESET_COLORS = [
  '#059669', // Emerald
  '#2563EB', // Blue
  '#D97706', // Amber
  '#9333EA', // Purple
  '#E11D48', // Rose
  '#0D9488', // Teal
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#0284C7', // Sky
  '#16A34A', // Green
];

interface PeopleManagerProps {
  people: Person[];
  onChange: (people: Person[]) => void;
}

export const PeopleManager: React.FC<PeopleManagerProps> = ({ people, onChange }) => {
  const [newPersonName, setNewPersonName] = useState('');

  const handleAddPerson = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newPersonName.trim() || `คนที่ ${people.length + 1}`;
    const nextColor = PRESET_COLORS[people.length % PRESET_COLORS.length];
    const newPerson: Person = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      color: nextColor,
      customShares: 1,
      customAmount: 0,
    };
    onChange([...people, newPerson]);
    setNewPersonName('');
  };

  const handleRemovePerson = (id: string) => {
    if (people.length <= 1) return;
    onChange(people.filter((p) => p.id !== id));
  };

  const handleUpdateName = (id: string, name: string) => {
    onChange(people.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const setPeopleCountPreset = (count: number) => {
    const currentList = [...people];
    if (count > currentList.length) {
      // Add more
      const toAdd = count - currentList.length;
      for (let i = 0; i < toAdd; i++) {
        const idx = currentList.length;
        currentList.push({
          id: `p-${Date.now()}-${idx}`,
          name: `คนที่ ${idx + 1}`,
          color: PRESET_COLORS[idx % PRESET_COLORS.length],
          customShares: 1,
          customAmount: 0,
        });
      }
    } else if (count < currentList.length) {
      // Trim
      currentList.splice(count);
    }
    onChange(currentList);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>2. ผู้ร่วมหาร ({people.length} คน)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เพิ่มหรือแก้ไขชื่อเพื่อนที่ร่วมโต๊ะ/ร่วมหารค่าใช้จ่าย
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-400">เลือกด่วน:</span>
          {[2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPeopleCountPreset(num)}
              className={`w-6 h-6 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                people.length === num
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Add Person Input Field */}
      <form onSubmit={handleAddPerson} className="flex gap-2">
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="พิมพ์ชื่อเพื่อน เช่น ต้น, พลอย, บอส (หรือกดเพิ่มเลย)"
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          type="submit"
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มคน</span>
        </button>
      </form>

      {/* List of People Badges / Editable Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {people.map((person, index) => (
          <div
            key={person.id}
            className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-50 border border-slate-200 rounded-xl group hover:border-slate-300 transition-all"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-xs"
              style={{ backgroundColor: person.color }}
            >
              {person.name.substring(0, 1) || (index + 1)}
            </div>

            <input
              type="text"
              value={person.name}
              onChange={(e) => handleUpdateName(person.id, e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none border-b border-transparent focus:border-emerald-500 py-0.5"
              placeholder={`คนที่ ${index + 1}`}
            />

            {people.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemovePerson(person.id)}
                className="w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                title="ลบคนนี้"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
