import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:parent_app/src/api/api_client.dart';
import 'test_harness.dart';

void main() {
  testWidgets('app smoke test: starts on the login screen when logged out', (tester) async {
    final api = ApiClient(
      baseUrl: 'http://test',
      client: MockClient((request) async => http.Response('not found', 404)),
    );

    await tester.pumpWidget(buildTestApp(api: api));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('identifierField')), findsOneWidget);
    expect(find.byKey(const Key('passwordField')), findsOneWidget);
    expect(find.byKey(const Key('submitButton')), findsOneWidget);
  });
}
