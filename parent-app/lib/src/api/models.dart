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
