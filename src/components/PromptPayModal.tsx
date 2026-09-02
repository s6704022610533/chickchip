import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { generatePromptPayPayload } from '../utils/promptpay';
import { formatCurrency } from '../utils/calculator';
import { X, QrCode, Copy, Check, Download } from 'lucide-react';

interface PromptPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPersonName?: string;
  amount: number;
  promptPayId: string;
  promptPayName?: string;
  onSavePromptPayId: (id: string, name?: string) => void;
}

export const PromptPayModal: React.FC<PromptPayModalProps> = ({
  isOpen,
  onClose,
  targetPersonName,
  amount,
  promptPayId,
  promptPayName,
  onSavePromptPayId,
}) => {
  const [phoneOrId, setPhoneOrId] = useState(promptPayId || '');
  const [accountName, setAccountName] = useState(promptPayName || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPhoneOrId(promptPayId || '');
  }, [promptPayId]);

  useEffect(() => {
    setAccountName(promptPayName || '');
  }, [promptPayName]);

  useEffect(() => {
    if (!phoneOrId.trim()) {
      setQrDataUrl('');
      return;
    }

    const payload = generatePromptPayPayload(phoneOrId.trim(), amount);
    if (payload) {
      QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [phoneOrId, amount]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePromptPayId(phoneOrId.trim(), accountName.trim());
  };

  const handleCopyId = () => {
    if (phoneOrId) {
      navigator.clipboard.writeText(phoneOrId.replace(/[^0-9]/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm border border-slate-200 shadow-xl space-y-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 mb-1">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {targetPersonName ? `QR สแกนจ่ายของ ${targetPersonName}` : 'QR สแกนจ่ายพร้อมเพย์'}
          </h3>
          <div className="text-2xl font-extrabold text-emerald-700">
            ฿{formatCurrency(amount)}
          </div>
        </div>

        {/* PromptPay Settings Form */}
        <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="promptpay-input">
              เบอร์โทรพร้อมเพย์ หรือ เลขบัตรประชาชน (10 หรือ 13 หลัก)
            </label>
            <div className="flex gap-1.5">
              <input
                id="promptpay-input"
                type="text"
                value={phoneOrId}
                onChange={(e) => {
                  setPhoneOrId(e.target.value);
                  onSavePromptPayId(e.target.value, accountName);
                }}
                placeholder="เช่น 0812345678"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleCopyId}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                title="คัดลอกเบอร์"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              กรอกเพื่อสร้าง QR Code มาตรฐานสำหรับสแกนโอนเงินผ่านแอปธนาคาร
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="promptpay-name-input">
              ชื่อบัญชี (ไม่บังคับ)
            </label>
            <input
              id="promptpay-name-input"
              type="text"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value);
                onSavePromptPayId(phoneOrId, e.target.value);
              }}
              placeholder="เช่น นายสมชาย สมบูรณ์"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* QR Code Display */}
        {qrDataUrl ? (
          <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="bg-emerald-700 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              PromptPay • พร้อมเพย์
            </div>
            <img
              src={qrDataUrl}
              alt="PromptPay QR Code"
              className="w-48 h-48 rounded-lg shadow-2xs"
            />
            {accountName && (
              <div className="text-xs font-semibold text-slate-700 text-center">
                {accountName}
              </div>
            )}
            <div className="text-[10px] text-slate-400 text-center">
              สแกนผ่านแอปธนาคารได้ทุกธนาคาร ยอดเงินระบุไว้แล้ว
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
            กรุณากรอกเบอร์โทรหรือเลขบัตรประชาชนด้านบนเพื่อแสดง QR Code
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
};
