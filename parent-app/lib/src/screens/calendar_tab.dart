import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme/text_direction.dart';

const _dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/// Calendar → Timetable / Attendance / Diary tabs, per the MVP plan.
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
                _DiaryTab(studentId: studentId, accessToken: accessToken, api: api),
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

    final byDay = <int, List<TimetableEntry>>{for (var d = 0; d < 7; d++) d: []};
    for (final e in _entries!) {
      byDay[e.dayOfWeek]!.add(e);
    }
    for (final entries in byDay.values) {
      entries.sort((a, b) => a.period.compareTo(b.period));
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        for (var day = 0; day < 7; day++)
          Card(
            key: Key('timetableDay$day'),
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_dayNames[day], style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 8),
                  if (byDay[day]!.isEmpty)
                    Text('No periods', style: Theme.of(context).textTheme.bodySmall)
                  else
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final entry in byDay[day]!)
                          Chip(
                            label: Text(
                              [
                                'P${entry.period}',
                                entry.subject,
                                '${entry.startTime}–${entry.endTime}',
                                if (entry.teacher != null) entry.teacher!,
                                if (entry.room != null) 'Room ${entry.room}',
                              ].join(' · '),
                            ),
                          ),
                      ],
                    ),
                ],
              ),
            ),
          ),
      ],
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
          Card(
            key: Key('attendanceDay${day.date}'),
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(dense: true, title: Text(day.date), trailing: Text(day.status)),
          ),
      ],
    );
  }
}

class _DiaryTab extends StatefulWidget {
  const _DiaryTab({required this.studentId, required this.accessToken, required this.api});
  final String studentId;
  final String accessToken;
  final ApiClient api;

  @override
  State<_DiaryTab> createState() => _DiaryTabState();
}

class _DiaryTabState extends State<_DiaryTab> {
  List<DiaryEntry>? _entries;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final month = DateTime.now().toIso8601String().substring(0, 7);
    try {
      final entries = await widget.api.diary(widget.accessToken, widget.studentId, month);
      if (mounted) setState(() => _entries = entries);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Center(child: Text(_error!));
    if (_entries == null) return const Center(child: CircularProgressIndicator());
    if (_entries!.isEmpty) return const Center(child: Text('No diary entries yet.'));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _entries!.length,
      itemBuilder: (context, i) {
        final e = _entries![i];
        return Card(
          key: Key('diaryEntry${e.id}'),
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    DirectionalText(e.subject, style: Theme.of(context).textTheme.titleSmall),
                    Text(
                      ' · ${e.date}${e.dueDate != null ? ' (due ${e.dueDate})' : ''}',
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                DirectionalText(e.text),
                if (e.attachments.isNotEmpty)
                  Wrap(
                    spacing: 8,
                    children: e.attachments
                        .map(
                          (a) => ActionChip(
                            label: Text(a.originalName),
                            onPressed: () => launchUrl(
                              widget.api.fileDownloadUrl(a.id, widget.accessToken),
                              mode: LaunchMode.externalApplication,
                            ),
                          ),
                        )
                        .toList(),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
