import 'package:flutter/material.dart';
import '../api/api_client.dart';
import '../api/models.dart';

const _dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/// Calendar → Timetable / Attendance / Diary tabs, per the MVP plan. Diary lands in the next
/// sprint (FEAT-008) — its tab is a placeholder for now so the three-tab structure is already in
/// place and doesn't need reshuffling later.
class CalendarTab extends StatelessWidget {
  const CalendarTab({super.key, required this.studentId, required this.accessToken, required this.api});

  final String studentId;
  final String accessToken;
  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          const TabBar(
            tabs: [Tab(text: 'Timetable'), Tab(text: 'Attendance'), Tab(text: 'Diary')],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _TimetableTab(studentId: studentId, accessToken: accessToken, api: api),
                _AttendanceTab(studentId: studentId, accessToken: accessToken, api: api),
                const Center(child: Text('Diary lands in the next sprint.')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TimetableTab extends StatefulWidget {
  const _TimetableTab({required this.studentId, required this.accessToken, required this.api});
  final String studentId;
  final String accessToken;
  final ApiClient api;

  @override
  State<_TimetableTab> createState() => _TimetableTabState();
}

class _TimetableTabState extends State<_TimetableTab> {
  List<TimetableEntry>? _entries;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final entries = await widget.api.timetable(widget.accessToken, widget.studentId);
      if (mounted) setState(() => _entries = entries);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Center(child: Text(_error!));
    if (_entries == null) return const Center(child: CircularProgressIndicator());
    if (_entries!.isEmpty) return const Center(child: Text('No timetable published yet.'));

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _entries!.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final e = _entries![i];
        return ListTile(
          leading: CircleAvatar(child: Text('P${e.period}')),
          title: Text(e.subject),
          subtitle: Text(
            [
              _dayNames[e.dayOfWeek],
              '${e.startTime}–${e.endTime}',
              if (e.teacher != null) e.teacher!,
              if (e.room != null) 'Room ${e.room}',
            ].join(' · '),
          ),
        );
      },
    );
  }
}

class _AttendanceTab extends StatefulWidget {
  const _AttendanceTab({required this.studentId, required this.accessToken, required this.api});
  final String studentId;
  final String accessToken;
  final ApiClient api;

  @override
  State<_AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<_AttendanceTab> {
  AttendanceReport? _report;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final month = DateTime.now().toIso8601String().substring(0, 7);
    try {
      final report = await widget.api.attendance(widget.accessToken, widget.studentId, month);
      if (mounted) setState(() => _report = report);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Center(child: Text(_error!));
    final report = _report;
    if (report == null) return const Center(child: CircularProgressIndicator());

    final today = DateTime.now().toIso8601String().substring(0, 10);
    final todayEntry = report.days.where((d) => d.date == today).cast<AttendanceDay?>().firstOrNull;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Today: ${todayEntry?.status ?? 'Not marked yet'}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text('${report.summary.attendancePercentage}% attendance this month'),
                Text(
                  'Present ${report.summary.present} · Absent ${report.summary.absent} · '
                  'Late ${report.summary.late} · Leave ${report.summary.leave} · '
                  'Holiday ${report.summary.holiday}',
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        for (final day in report.days.reversed)
          ListTile(dense: true, title: Text(day.date), trailing: Text(day.status)),
      ],
    );
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
