import { computeNetBalance, PersonalCreditTransaction } from '../queries/creditBook';

describe('computeNetBalance', () => {
  it('should return positive balance when you give more than you get (receivable)', () => {
    const txns: PersonalCreditTransaction[] = [
      {
        id: '1',
        creator_id: 'u1',
        party_id: 'p1',
        counterparty_mob: '1234567890',
        txn_date: '2023-01-01',
        type: 'gave',
        amount: 1000,
        note: 'lent',
        settled: false,
        settled_at: null,
        created_at: '2023-01-01',
      },
      {
        id: '2',
        creator_id: 'u1',
        party_id: 'p1',
        counterparty_mob: '1234567890',
        txn_date: '2023-01-02',
        type: 'got',
        amount: 400,
        note: 'received partially',
        settled: false,
        settled_at: null,
        created_at: '2023-01-02',
      },
    ];
    // 1000 (gave) - 400 (got) = 600 (receivable)
    expect(computeNetBalance(txns)).toBe(600);
  });

  it('should return negative balance when you get more than you give (payable)', () => {
    const txns: PersonalCreditTransaction[] = [
      {
        id: '1',
        creator_id: 'u1',
        party_id: 'p1',
        counterparty_mob: '1234567890',
        txn_date: '2023-01-01',
        type: 'gave',
        amount: 500,
        note: 'lent',
        settled: false,
        settled_at: null,
        created_at: '2023-01-01',
      },
      {
        id: '2',
        creator_id: 'u1',
        party_id: 'p1',
        counterparty_mob: '1234567890',
        txn_date: '2023-01-02',
        type: 'got',
        amount: 1200,
        note: 'borrowed more',
        settled: false,
        settled_at: null,
        created_at: '2023-01-02',
      },
    ];
    // 500 (gave) - 1200 (got) = -700 (payable)
    expect(computeNetBalance(txns)).toBe(-700);
  });

  it('should return zero when balanced', () => {
    const txns: PersonalCreditTransaction[] = [
      {
        id: '1',
        creator_id: 'u1',
        party_id: 'p1',
        counterparty_mob: '1234567890',
        txn_date: '2023-01-01',
        type: 'gave',
        amount: 1000,
        note: 'lent',
        settled: false,
        settled_at: null,
        created_at: '2023-01-01',
      },
      {
        id: '2',
        creator_id: 'u1',
        party_id: 'p1',
        counterparty_mob: '1234567890',
        txn_date: '2023-01-02',
        type: 'got',
        amount: 1000,
        note: 'repaid',
        settled: false,
        settled_at: null,
        created_at: '2023-01-02',
      },
    ];
    expect(computeNetBalance(txns)).toBe(0);
  });
});
