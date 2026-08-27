class LoginResponse {
  const LoginResponse({required this.accessToken, required this.refreshToken, required this.role});

  final String accessToken;
  final String refreshToken;
  final String role;

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
    accessToken: json['accessToken'] as String,
    refreshToken: json['refreshToken'] as String,
    role: json['role'] as String,
  );
}

class ChildSummary {
  const ChildSummary({
    required this.id,
    required this.name,
    required this.grNumber,
    required this.campus,
    required this.schoolClass,
    required this.section,
  });

  final String id;
  final String name;
  final String grNumber;
  final String campus;
  final String schoolClass;
  final String section;

  factory ChildSummary.fromJson(Map<String, dynamic> json) => ChildSummary(
    id: json['id'] as String,
    name: json['name'] as String,
    grNumber: json['grNumber'] as String,
    campus: json['campus'] as String,
    schoolClass: json['class'] as String,
    section: json['section'] as String,
  );
}

class TimetableEntry {
  const TimetableEntry({
    required this.dayOfWeek,
    required this.period,
    required this.startTime,
    required this.endTime,
    required this.subject,
    required this.teacher,
    required this.room,
  });

  final int dayOfWeek;
  final int period;
  final String startTime;
  final String endTime;
  final String subject;
  final String? teacher;
  final String? room;

  factory TimetableEntry.fromJson(Map<String, dynamic> json) => TimetableEntry(
    dayOfWeek: json['dayOfWeek'] as int,
    period: json['period'] as int,
    startTime: json['startTime'] as String,
    endTime: json['endTime'] as String,
    subject: json['subject'] as String,
    teacher: json['teacher'] as String?,
    room: json['room'] as String?,
  );
}

class AttendanceDay {
  const AttendanceDay({required this.date, required this.status});

  final String date;
  final String status;

  factory AttendanceDay.fromJson(Map<String, dynamic> json) =>
      AttendanceDay(date: json['date'] as String, status: json['status'] as String);
}

class AttendanceSummary {
  const AttendanceSummary({
    required this.present,
    required this.absent,
    required this.late,
    required this.holiday,
    required this.leave,
    required this.attendancePercentage,
  });

  final int present;
  final int absent;
  final int late;
  final int holiday;
  final int leave;
  final int attendancePercentage;

  factory AttendanceSummary.fromJson(Map<String, dynamic> json) => AttendanceSummary(
    present: json['present'] as int,
    absent: json['absent'] as int,
    late: json['late'] as int,
    holiday: json['holiday'] as int,
    leave: json['leave'] as int,
    attendancePercentage: json['attendancePercentage'] as int,
  );
}

class AttendanceReport {
  const AttendanceReport({required this.days, required this.summary});

  final List<AttendanceDay> days;
  final AttendanceSummary summary;

  factory AttendanceReport.fromJson(Map<String, dynamic> json) => AttendanceReport(
    days: (json['days'] as List<dynamic>)
        .map((e) => AttendanceDay.fromJson(e as Map<String, dynamic>))
        .toList(),
    summary: AttendanceSummary.fromJson(json['summary'] as Map<String, dynamic>),
  );
}
