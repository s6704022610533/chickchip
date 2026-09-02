export type SplitMode = 'EQUAL' | 'ITEMIZED' | 'CUSTOM';

export type FeeType = 'PERCENT' | 'FIXED';

export interface FeeConfig {
  enabled: boolean;
  type: FeeType;
  value: number; // percentage or fixed THB
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedPersonIds: string[]; // Person IDs sharing this item
}

export interface Person {
  id: string;
  name: string;
  color: string;
  customAmount?: number; // for custom mode
  customShares?: number; // for custom share ratio
}

export interface BillState {
  title: string;
  subtotalMode: 'AUTO' | 'MANUAL'; // Auto sum from items vs manual input
  manualSubtotal: number;
  discount: FeeConfig;
  serviceCharge: FeeConfig;
  vat: FeeConfig;
  vatAppliedOnServiceCharge: boolean; // standard Thai restaurant: VAT calculated on (Subtotal - Discount + ServiceCharge)
  feeDistribution: 'PROPORTIONAL' | 'EQUAL'; // In itemized mode: how fees/discounts are split
  people: Person[];
  items: BillItem[];
  splitMode: SplitMode;
  promptPayId?: string; // Phone number or ID card for QR code
  promptPayName?: string; // Account holder name
}

export interface PersonBreakdown {
  personId: string;
  personName: string;
  personColor: string;
  baseAmount: number; // Subtotal share
  discountShare: number;
  serviceChargeShare: number;
  vatShare: number;
  totalToPay: number; // Rounded to 2 decimals
  rawTotal: number;
  itemsSummary: { itemName: string; portionPrice: number; quantity: number }[];
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  serviceChargeAmount: number;
  vatAmount: number;
  grandTotal: number;
  breakdowns: PersonBreakdown[];
  calculatedSum: number;
  difference: number;
  isExactMatch: boolean;
}
