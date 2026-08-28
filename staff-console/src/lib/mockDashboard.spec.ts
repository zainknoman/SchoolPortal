import { describe, it, expect } from 'vitest';
import { getMockDashboardSummary } from './mockDashboard';

describe('getMockDashboardSummary', () => {
  it('returns the primary KPI figures and a 7-day trend', () => {
    const summary = getMockDashboardSummary();

    expect(summary.studentsTotal).toBe(1284);
    expect(summary.presentTodayPercent).toBe(93.5);
    expect(summary.feesCollectedPkr).toBe(2_400_000);
    expect(summary.feesOutstandingPkr).toBe(680_000);
    expect(summary.atRiskStudents).toBe(37);
    expect(summary.absentToday).toBe(84);
    expect(summary.teachersAbsent).toBe(6);
    expect(summary.weeklyTrend).toHaveLength(7);
    expect(summary.weeklyTrend[0]!.day).toBe('Mon');
    expect(summary.recentAlerts.length).toBeGreaterThan(0);
  });
});
