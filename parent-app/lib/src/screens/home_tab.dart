import 'package:flutter/material.dart';
import '../api/api_client.dart';
import '../api/models.dart';

/// Home tab (bottom-nav index 0) — greeting, active-child summary, a 2x2 stat/quick-link grid,
/// and the most recent announcements. Fetches its own attendance + circulars data, the same
/// self-contained pattern `CalendarTab` and `CircularsTab` already use.
class HomeTab extends StatefulWidget {
  const HomeTab({
    super.key,
    required this.studentId,
    required this.childName,
    required this.childClass,
    required this.accessToken,
    required this.api,
    required this.onOpenTimetable,
    required this.onSeeAllAnnouncements,
  });

  final String studentId;
  final String childName;
  final String childClass;
  final String accessToken;
  final ApiClient api;
  final VoidCallback onOpenTimetable;
  final VoidCallback onSeeAllAnnouncements;

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  AttendanceReport? _attendance;
  List<CircularSummary>? _circulars;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final month = DateTime.now().toIso8601String().substring(0, 7);
    try {
      final attendance = await widget.api.attendance(widget.accessToken, widget.studentId, month);
      final circulars = await widget.api.circulars(widget.accessToken);
      if (!mounted) return;
      setState(() {
        _attendance = attendance;
        _circulars = circulars;
      });
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Center(child: Text(_error!));
    final attendance = _attendance;
    final circulars = _circulars;
    if (attendance == null || circulars == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final recentAnnouncements = [...circulars]..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
    final topAnnouncements = recentAnnouncements.take(2).toList();

    // A SingleChildScrollView + Column (rather than ListView) so every child — including the
    // 2x2 stat grid and the announcements below it — is built eagerly. A ListView's SliverList
    // estimates offscreen extents from already-laid-out siblings, and the tall GridView.count
    // ahead of the announcements section made it under-estimate and stop building children that
    // are well within the default 250px cache extent.
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Assalam-o-Alaikum', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const CircleAvatar(child: Icon(Icons.person_outline)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.childName, style: Theme.of(context).textTheme.titleSmall),
                        Text(widget.childClass, style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 2.6,
            children: [
              _StatCard(
                key: const Key('homeAttendanceCard'),
                label: 'Attendance',
                value: '${attendance.summary.attendancePercentage}%',
                hint: 'This Month',
              ),
              const _StatCard(
                key: Key('homeFeesCard'),
                label: 'Fees',
                value: '—',
                hint: 'Outstanding',
              ),
              const _StatCard(
                key: Key('homeResultsCard'),
                label: 'Results',
                value: 'View latest results',
              ),
              _StatCard(
                key: const Key('homeTimetableCard'),
                label: 'Timetable',
                value: 'View timetable',
                onTap: widget.onOpenTimetable,
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Recent Announcements', style: Theme.of(context).textTheme.titleSmall),
              TextButton(
                key: const Key('homeSeeAllAnnouncements'),
                onPressed: widget.onSeeAllAnnouncements,
                child: const Text('See All'),
              ),
            ],
          ),
          if (topAnnouncements.isEmpty) const Text('No announcements yet.'),
          for (final c in topAnnouncements)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(title: Text(c.title), subtitle: Text(c.description)),
            ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({super.key, required this.label, required this.value, this.hint, this.onTap});

  final String label;
  final String value;
  final String? hint;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label, style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 4),
              Text(value, style: Theme.of(context).textTheme.titleMedium),
              if (hint != null) Text(hint!, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}
