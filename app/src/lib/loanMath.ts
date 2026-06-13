import { addMonths, setDate, format } from 'date-fns';

export interface AmortizationRow {
  installment_no: number;
  emi_month: string; // 'YYYY-MM-DD'
  principal_component: number;
  interest_component: number;
  closing_balance: number;
}

/**
 * Calculates the EMI amount.
 * 
 * @param principal The loan principal amount
 * @param annualRate Annual interest rate (percentage)
 * @param tenureMonths Tenure of the loan in months
 * @param type 'reducing' or 'flat'
 * @returns The exact mathematical EMI.
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  type: 'reducing' | 'flat'
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) {
    return principal / tenureMonths;
  }

  if (type === 'flat') {
    const totalInterest = principal * (annualRate / 100) * (tenureMonths / 12);
    return (principal + totalInterest) / tenureMonths;
  }

  // Reducing balance
  const r = annualRate / 12 / 100;
  const numerator = principal * r * Math.pow(1 + r, tenureMonths);
  const denominator = Math.pow(1 + r, tenureMonths) - 1;
  return numerator / denominator;
}

/**
 * Generates the Amortization Schedule.
 * 
 * @param principal The loan principal amount
 * @param annualRate Annual interest rate (percentage)
 * @param tenureMonths Tenure of the loan in months
 * @param type 'reducing' | 'flat'
 * @param startDate The start date of the loan (Date object or ISO string)
 * @param emiDay The day of the month the EMI is due
 * @returns Array of AmortizationRow representing the schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  type: 'reducing' | 'flat',
  startDate: Date | string,
  emiDay: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const emi = calculateEMI(principal, annualRate, tenureMonths, type);
  
  let balance = principal;
  let currentMonthDate = new Date(startDate);
  // Ensure the date is valid
  if (isNaN(currentMonthDate.getTime())) {
    currentMonthDate = new Date();
  }

  for (let i = 1; i <= tenureMonths; i++) {
    // Advance month
    currentMonthDate = addMonths(currentMonthDate, 1);
    
    // Attempt to set to EMI day, fallback to last valid day of month if overflow
    const maxDaysInNextMonth = new Date(
      currentMonthDate.getFullYear(),
      currentMonthDate.getMonth() + 1,
      0
    ).getDate();
    
    const targetDay = Math.min(emiDay, maxDaysInNextMonth);
    const emiDate = setDate(currentMonthDate, targetDay);

    let interestComponent = 0;
    let principalComponent = 0;

    if (type === 'flat') {
      // For flat, interest and principal are constant portions of EMI
      // Total Interest = P * r * t
      // Per month = Total Interest / tenureMonths
      const totalInterest = principal * (annualRate / 100) * (tenureMonths / 12);
      interestComponent = totalInterest / tenureMonths;
      principalComponent = emi - interestComponent;
    } else {
      // Reducing balance
      const r = annualRate / 12 / 100;
      interestComponent = balance * r;
      principalComponent = emi - interestComponent;
    }

    // Handle the final penny correction on the last installment
    if (i === tenureMonths) {
      principalComponent = balance;
      // Recalculate EMI just for presentation of final exact payment if you like,
      // but usually the interest is the same, and principal clears the balance.
    }

    balance -= principalComponent;
    
    // Prevent negative balance due to floating point
    if (balance < 0.005) {
      balance = 0;
    }

    schedule.push({
      installment_no: i,
      emi_month: format(emiDate, 'yyyy-MM-dd'),
      principal_component: Math.round(principalComponent * 100) / 100,
      interest_component: Math.round(interestComponent * 100) / 100,
      closing_balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
}
