import { describe, it, expect } from 'vitest';
import { getMockReconciliationQueue, getSuggestedMatch } from './mockFees';

describe('getMockReconciliationQueue', () => {
  it('returns 4 transactions, 3 of them exceptions', async () => {
    const queue = await getMockReconciliationQueue();
    expect(queue).toHaveLength(4);
    expect(queue.filter((t) => t.status === 'EXCEPTION')).toHaveLength(3);
    expect(queue.filter((t) => t.status === 'AUTO_MATCHED')).toHaveLength(1);
  });
});

describe('getSuggestedMatch', () => {
  it('returns a suggestion for a known transaction id', () => {
    expect(getSuggestedMatch('t1')).toEqual({
      invoiceNo: 'INV-2026-000123',
      studentName: 'Hassan Ahmed',
      amountPkr: 18450,
    });
  });

  it('returns null for an unknown transaction id', () => {
    expect(getSuggestedMatch('does-not-exist')).toBeNull();
  });
});
