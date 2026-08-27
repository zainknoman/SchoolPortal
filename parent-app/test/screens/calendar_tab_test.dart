import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:parent_app/src/api/api_client.dart';
import 'package:parent_app/src/screens/calendar_tab.dart';

void main() {
  ApiClient makeClient() {
    return ApiClient(
      baseUrl: 'http://test',
      client: MockClient((request) async {
        if (request.url.path == '/api/v1/students/s1/timetable') {
          return http.Response(
            jsonEncode([
              {
                'dayOfWeek': 1,
                'period': 1,
                'startTime': '08:00',
                'endTime': '08:40',
                'subject': 'English',
                'teacher': 'Ms. Sample',
                'room': '3A',
              },
            ]),
            200,
          );
        }
        if (request.url.path == '/api/v1/students/s1/attendance') {
          return http.Response(
            jsonEncode({
              'days': [
                {'date': '2026-08-27', 'status': 'PRESENT'},
              ],
              'summary': {
                'present': 18,
                'absent': 2,
                'late': 1,
                'holiday': 0,
                'leave': 0,
                'attendancePercentage': 86,
              },
            }),
            200,
          );
        }
        return http.Response('not found', 404);
      }),
    );
  }

  testWidgets('Timetable tab shows the structured entry', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: CalendarTab(studentId: 's1', accessToken: 'tok', api: makeClient())),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('English'), findsOneWidget);
    expect(find.textContaining('Ms. Sample'), findsOneWidget);
    expect(find.textContaining('08:00'), findsOneWidget);
  });

  testWidgets('Attendance tab shows the percentage and today\'s status', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: CalendarTab(studentId: 's1', accessToken: 'tok', api: makeClient())),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Attendance'));
    await tester.pumpAndSettle();

    expect(find.textContaining('86%'), findsOneWidget);
    expect(find.textContaining('18'), findsWidgets);
  });
}
