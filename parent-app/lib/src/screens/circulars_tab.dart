import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme/text_direction.dart';

/// Notifications tab content — school/section circulars for the signed-in parent (not per-child;
/// a parent sees every circular they're a recipient of, regardless of which child tab is active).
class CircularsTab extends StatefulWidget {
  const CircularsTab({
    super.key,
    required this.accessToken,
    required this.api,
    this.onUnreadChanged,
  });

  final String accessToken;
  final ApiClient api;
  final ValueChanged<int>? onUnreadChanged;

  @override
  State<CircularsTab> createState() => _CircularsTabState();
}

class _CircularsTabState extends State<CircularsTab> {
  List<CircularSummary>? _circulars;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final circulars = await widget.api.circulars(widget.accessToken);
      if (mounted) {
        setState(() => _circulars = circulars);
        widget.onUnreadChanged?.call(circulars.where((c) => c.readAt == null).length);
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  Future<void> _onOpen(CircularSummary circular) async {
    if (circular.readAt != null) return;
    await widget.api.markCircularRead(widget.accessToken, circular.id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) return Center(child: Text(_error!));
    final circulars = _circulars;
    if (circulars == null) return const Center(child: CircularProgressIndicator());
    if (circulars.isEmpty) return const Center(child: Text('No circulars yet.'));

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: circulars.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final c = circulars[i];
        final isUnread = c.readAt == null;
        return ListTile(
          onTap: () => _onOpen(c),
          leading: Icon(isUnread ? Icons.circle : Icons.circle_outlined, size: 12),
          title: Text(
            c.title,
            style: TextStyle(fontWeight: isUnread ? FontWeight.bold : FontWeight.normal),
          ),
          subtitle: DirectionalText(c.description),
          trailing: c.attachments.isEmpty
              ? null
              : IconButton(
                  icon: const Icon(Icons.attachment),
                  onPressed: () => launchUrl(
                    widget.api.fileDownloadUrl(c.attachments.first.id, widget.accessToken),
                    mode: LaunchMode.externalApplication,
                  ),
                ),
        );
      },
    );
  }
}
