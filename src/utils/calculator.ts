import { BillState, CalculationResult, PersonBreakdown } from '../types';

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(num: number): string {
  return (num || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function calculateBill(state: BillState): CalculationResult {
  const {
    subtotalMode,
    manualSubtotal,
    items,
    people,
    discount,
    serviceCharge,
    vat,
    vatAppliedOnServiceCharge,
    feeDistribution,
    splitMode,
  } = state;

  const peopleCount = Math.max(people.length, 1);

  // 1. Calculate Base Subtotal
  let subtotal = 0;
  if (subtotalMode === 'AUTO') {
    subtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  } else {
    subtotal = Math.max(0, Number(manualSubtotal) || 0);
  }

  // 2. Calculate Discount
  let discountAmount = 0;
  if (discount.enabled && subtotal > 0) {
    if (discount.type === 'PERCENT') {
      discountAmount = (subtotal * Math.max(0, Number(discount.value) || 0)) / 100;
    } else {
      discountAmount = Math.max(0, Number(discount.value) || 0);
    }
    discountAmount = Math.min(discountAmount, subtotal); // Discount cannot exceed subtotal
  }

  const netSubtotal = Math.max(0, subtotal - discountAmount);

  // 3. Calculate Service Charge
  let serviceChargeAmount = 0;
  if (serviceCharge.enabled && netSubtotal > 0) {
    if (serviceCharge.type === 'PERCENT') {
      serviceChargeAmount = (netSubtotal * Math.max(0, Number(serviceCharge.value) || 0)) / 100;
    } else {
      serviceChargeAmount = Math.max(0, Number(serviceCharge.value) || 0);
    }
  }

  // 4. Calculate VAT
  let vatAmount = 0;
  const taxableBase = vatAppliedOnServiceCharge
    ? netSubtotal + serviceChargeAmount
    : netSubtotal;

  if (vat.enabled && taxableBase > 0) {
    if (vat.type === 'PERCENT') {
      vatAmount = (taxableBase * Math.max(0, Number(vat.value) || 0)) / 100;
    } else {
      vatAmount = Math.max(0, Number(vat.value) || 0);
    }
  }

  // 5. Grand Total
  const grandTotal = round2(netSubtotal + serviceChargeAmount + vatAmount);

  // 6. Split Calculations
  let breakdowns: PersonBreakdown[] = [];

  if (splitMode === 'EQUAL') {
    const rawPerPersonTotal = grandTotal / peopleCount;
    const rawPerPersonBase = subtotal / peopleCount;
    const rawPerPersonDiscount = discountAmount / peopleCount;
    const rawPerPersonSC = serviceChargeAmount / peopleCount;
    const rawPerPersonVat = vatAmount / peopleCount;

    breakdowns = people.map((person) => ({
      personId: person.id,
      personName: person.name,
      personColor: person.color,
      baseAmount: round2(rawPerPersonBase),
      discountShare: round2(rawPerPersonDiscount),
      serviceChargeShare: round2(rawPerPersonSC),
      vatShare: round2(rawPerPersonVat),
      rawTotal: rawPerPersonTotal,
      totalToPay: round2(rawPerPersonTotal),
      itemsSummary: [],
    }));
  } else if (splitMode === 'ITEMIZED') {
    // Calculate each person's consumed items
    const personBaseMap = new Map<string, number>();
    const personItemsSummaryMap = new Map<string, { itemName: string; portionPrice: number; quantity: number }[]>();

    people.forEach((p) => {
      personBaseMap.set(p.id, 0);
      personItemsSummaryMap.set(p.id, []);
    });

    // Distribute items
    items.forEach((item) => {
      const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      const assigned = item.assignedPersonIds.filter((id) => people.some((p) => p.id === id));
      
      // If nobody selected, share among everyone
      const targetPeopleIds = assigned.length > 0 ? assigned : people.map((p) => p.id);
      const portion = itemTotal / Math.max(targetPeopleIds.length, 1);

      targetPeopleIds.forEach((pid) => {
        const current = personBaseMap.get(pid) || 0;
        personBaseMap.set(pid, current + portion);

        const currentList = personItemsSummaryMap.get(pid) || [];
        currentList.push({
          itemName: item.name || 'รายการสินค้า',
          portionPrice: round2(portion),
          quantity: item.quantity,
        });
        personItemsSummaryMap.set(pid, currentList);
      });
    });

    const totalCalculatedBase = Array.from(personBaseMap.values()).reduce((a, b) => a + b, 0);

    breakdowns = people.map((person) => {
      const personBase = personBaseMap.get(person.id) || 0;
      let pDiscount = 0;
      let pSC = 0;
      let pVat = 0;

      if (feeDistribution === 'PROPORTIONAL' && totalCalculatedBase > 0) {
        const ratio = personBase / totalCalculatedBase;
        pDiscount = discountAmount * ratio;
        pSC = serviceChargeAmount * ratio;
        pVat = vatAmount * ratio;
      } else {
        // Equal split of fees
        pDiscount = discountAmount / peopleCount;
        pSC = serviceChargeAmount / peopleCount;
        pVat = vatAmount / peopleCount;
      }

      const pRawTotal = Math.max(0, personBase - pDiscount + pSC + pVat);

      return {
        personId: person.id,
        personName: person.name,
        personColor: person.color,
        baseAmount: round2(personBase),
        discountShare: round2(pDiscount),
        serviceChargeShare: round2(pSC),
        vatShare: round2(pVat),
        rawTotal: pRawTotal,
        totalToPay: round2(pRawTotal),
        itemsSummary: personItemsSummaryMap.get(person.id) || [],
      };
    });
  } else if (splitMode === 'CUSTOM') {
    // Custom split by shares or fixed amounts
    const hasCustomAmounts = people.some((p) => (p.customAmount ?? 0) > 0);
    const totalCustomShares = people.reduce((sum, p) => sum + (Number(p.customShares) || 1), 0);

    if (hasCustomAmounts) {
      // Use direct custom amount input
      breakdowns = people.map((person) => {
        const amt = Number(person.customAmount) || 0;
        return {
          personId: person.id,
          personName: person.name,
          personColor: person.color,
          baseAmount: round2(amt),
          discountShare: 0,
          serviceChargeShare: 0,
          vatShare: 0,
          rawTotal: amt,
          totalToPay: round2(amt),
          itemsSummary: [],
        };
      });
    } else {
      // Split by shares
      breakdowns = people.map((person) => {
        const shares = Number(person.customShares) || 1;
        const ratio = totalCustomShares > 0 ? shares / totalCustomShares : 1 / peopleCount;
        const rawTotal = grandTotal * ratio;

        return {
          personId: person.id,
          personName: person.name,
          personColor: person.color,
          baseAmount: round2(subtotal * ratio),
          discountShare: round2(discountAmount * ratio),
          serviceChargeShare: round2(serviceChargeAmount * ratio),
          vatShare: round2(vatAmount * ratio),
          rawTotal: rawTotal,
          totalToPay: round2(rawTotal),
          itemsSummary: [],
        };
      });
    }
  }

  // 7. Reconciliation & Cent Difference Fix (Ensure sum matches grandTotal exactly)
  const calculatedSum = round2(breakdowns.reduce((acc, b) => acc + b.totalToPay, 0));
  const diff = round2(grandTotal - calculatedSum);
  const isExactMatch = Math.abs(diff) < 0.001;

  // Auto-distribute penny discrepancy if diff is minimal (e.g. ±0.01, ±0.02)
  // We sort by largest decimal remainder to adjust fairly
  if (!isExactMatch && Math.abs(diff) <= 0.05 && breakdowns.length > 0) {
    // Create copy for fine-tuned reconciliation
    const centsToAdjust = Math.round(diff * 100);
    if (centsToAdjust !== 0) {
      // Distribute 1 cent at a time to highest raw remainder
      const sorted = [...breakdowns]
        .map((b, idx) => ({ idx, remainder: b.rawTotal - Math.floor(b.rawTotal * 100) / 100 }))
        .sort((a, b) => (centsToAdjust > 0 ? b.remainder - a.remainder : a.remainder - b.remainder));

      const adjustmentDirection = centsToAdjust > 0 ? 0.01 : -0.01;
      const count = Math.min(Math.abs(centsToAdjust), breakdowns.length);

      for (let i = 0; i < count; i++) {
        const targetIndex = sorted[i].idx;
        breakdowns[targetIndex].totalToPay = round2(breakdowns[targetIndex].totalToPay + adjustmentDirection);
      }
    }
  }

  // Recalculate after auto cent adjustment
  const finalCalculatedSum = round2(breakdowns.reduce((acc, b) => acc + b.totalToPay, 0));
  const finalDiff = round2(grandTotal - finalCalculatedSum);

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    taxableAmount: round2(taxableBase),
    serviceChargeAmount: round2(serviceChargeAmount),
    vatAmount: round2(vatAmount),
    grandTotal: grandTotal,
    breakdowns,
    calculatedSum: finalCalculatedSum,
    difference: finalDiff,
    isExactMatch: Math.abs(finalDiff) < 0.001,
  };
}
