import { calculateEMI, generateAmortizationSchedule } from '../loanMath';

describe('Loan Math', () => {
  describe('calculateEMI', () => {
    it('calculates reducing balance EMI correctly', () => {
      // 100,000 principal, 10% annual rate, 12 months
      const emi = calculateEMI(100000, 10, 12, 'reducing');
      // P = 100000, r = 10/(12*100) = 0.008333, n = 12
      // EMI = 8791.59
      expect(Math.round(emi * 100) / 100).toBe(8791.59);
    });

    it('calculates flat rate EMI correctly', () => {
      // 100,000 principal, 10% annual rate, 12 months
      const emi = calculateEMI(100000, 10, 12, 'flat');
      // Total Interest = 100000 * 0.1 * 1 = 10000
      // Total amount = 110000
      // EMI = 110000 / 12 = 9166.67
      expect(Math.round(emi * 100) / 100).toBe(9166.67);
    });

    it('returns principal / months if interest is 0', () => {
      const emi = calculateEMI(120000, 0, 12, 'reducing');
      expect(emi).toBe(10000);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('generates a correct schedule for reducing balance', () => {
      const schedule = generateAmortizationSchedule(
        100000,
        10,
        12,
        'reducing',
        new Date('2024-01-01'),
        5
      );

      expect(schedule.length).toBe(12);
      
      // First month
      expect(schedule[0].installment_no).toBe(1);
      expect(schedule[0].emi_month).toBe('2024-02-05');
      
      // Interest = 100000 * (10/1200) = 833.33
      expect(schedule[0].interest_component).toBe(833.33);
      // Principal = 8791.59 - 833.33 = 7958.26
      expect(schedule[0].principal_component).toBe(7958.26);
      
      // Last month
      const last = schedule[11];
      expect(last.installment_no).toBe(12);
      expect(last.closing_balance).toBe(0); // Closes exactly
    });

    it('generates a correct schedule for flat rate', () => {
      const schedule = generateAmortizationSchedule(
        100000,
        10,
        12,
        'flat',
        new Date('2024-01-15'),
        10
      );

      expect(schedule.length).toBe(12);
      
      // First month
      expect(schedule[0].installment_no).toBe(1);
      expect(schedule[0].emi_month).toBe('2024-02-10');
      
      // Flat rate, interest per month = 10000 / 12 = 833.33
      expect(schedule[0].interest_component).toBe(833.33);
      
      // Last month
      const last = schedule[11];
      expect(last.closing_balance).toBe(0);
    });

    it('handles short months (e.g. February 28/29th) gracefully', () => {
      const schedule = generateAmortizationSchedule(
        100000,
        10,
        3,
        'reducing',
        new Date('2024-01-01'), // leap year
        31 // Set EMI day to 31
      );

      expect(schedule[0].emi_month).toBe('2024-02-29'); // February has 29 days
      expect(schedule[1].emi_month).toBe('2024-03-31');
      expect(schedule[2].emi_month).toBe('2024-04-30'); // April has 30 days
    });
  });
});
