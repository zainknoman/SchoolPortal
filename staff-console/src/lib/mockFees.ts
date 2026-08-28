export type ReconciliationStatus = 'AUTO_MATCHED' | 'EXCEPTION';

export interface ReconciliationTransaction {
  id: string;
  timestamp: string;
  rail: string;
  transactionId: string;
  amountPkr: number;
  status: ReconciliationStatus;
  exceptionReason: string | null;
}

export interface SuggestedMatch {
  invoiceNo: string;
  studentName: string;
  amountPkr: number;
}

export function getMockReconciliationQueue(): ReconciliationTransaction[] {
  return [
    {
      id: 't1',
      timestamp: '27 Aug 2026, 14:32',
      rail: '1Link',
      transactionId: '1L-998234-A',
      amountPkr: 18450,
      status: 'EXCEPTION',
      exceptionReason: 'Invalid Challan Number',
    },
    {
      id: 't2',
      timestamp: '27 Aug 2026, 11:15',
      rail: 'JazzCash',
      transactionId: 'JC-554129-X',
      amountPkr: 22000,
      status: 'EXCEPTION',
      exceptionReason: 'Amount Mismatch (Partial Payment)',
    },
    {
      id: 't3',
      timestamp: '27 Aug 2026, 10:45',
      rail: 'EasyPaisa',
      transactionId: 'EP-776211-Y',
      amountPkr: 15000,
      status: 'AUTO_MATCHED',
      exceptionReason: null,
    },
    {
      id: 't4',
      timestamp: '27 Aug 2026, 09:20',
      rail: '1Link',
      transactionId: '1L-112345-B',
      amountPkr: 18450,
      status: 'EXCEPTION',
      exceptionReason: 'Duplicate Transaction Detected',
    },
  ];
}

const SUGGESTIONS: Record<string, SuggestedMatch> = {
  t1: { invoiceNo: 'INV-2026-000123', studentName: 'Hassan Ahmed', amountPkr: 18450 },
  t4: { invoiceNo: 'INV-2026-000456', studentName: 'Hassan Ahmed', amountPkr: 18450 },
};

export function getSuggestedMatch(transactionId: string): SuggestedMatch | null {
  return SUGGESTIONS[transactionId] ?? null;
}
