export interface WeeklyTrendPoint {
  day: string;
  attendancePercent: number;
  feesCollectedPkr: number;
}

export interface DashboardAlert {
  message: string;
  timeAgo: string;
}

export interface DashboardSummary {
  studentsTotal: number;
  presentTodayPercent: number;
  feesCollectedPkr: number;
  feesOutstandingPkr: number;
  atRiskStudents: number;
  absentToday: number;
  teachersAbsent: number;
  weeklyTrend: WeeklyTrendPoint[];
  recentAlerts: DashboardAlert[];
}

export async function getMockDashboardSummary(): Promise<DashboardSummary> {
  return {
    studentsTotal: 1284,
    presentTodayPercent: 93.5,
    feesCollectedPkr: 2_400_000,
    feesOutstandingPkr: 680_000,
    atRiskStudents: 37,
    absentToday: 84,
    teachersAbsent: 6,
    weeklyTrend: [
      { day: 'Mon', attendancePercent: 88, feesCollectedPkr: 320_000 },
      { day: 'Tue', attendancePercent: 95, feesCollectedPkr: 410_000 },
      { day: 'Wed', attendancePercent: 82, feesCollectedPkr: 360_000 },
      { day: 'Thu', attendancePercent: 92, feesCollectedPkr: 460_000 },
      { day: 'Fri', attendancePercent: 88, feesCollectedPkr: 300_000 },
      { day: 'Sat', attendancePercent: 95, feesCollectedPkr: 410_000 },
      { day: 'Sun', attendancePercent: 90, feesCollectedPkr: 360_000 },
    ],
    recentAlerts: [
      { message: '12 students absent 3+ days', timeAgo: '10m ago' },
      { message: 'Fee reminder failed for 18 parents', timeAgo: '45m ago' },
      { message: 'Exam marks pending for 2 classes', timeAgo: '2h ago' },
    ],
  };
}
