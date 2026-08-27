import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models.dart';

class ApiException implements Exception {
  ApiException(this.message, this.statusCode);
  final String message;
  final int statusCode;

  @override
  String toString() => message;
}

/// Thin wrapper over the shared SEEDS backend — the same `/api/v1` contract the staff console
/// calls. Takes an injected [http.Client] so tests can supply `MockClient` instead of hitting a
/// real server.
class ApiClient {
  ApiClient({required this.baseUrl, http.Client? client}) : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  String _errorMessage(http.Response res) {
    try {
      final body = jsonDecode(res.body);
      if (body is Map && body['message'] is String) return body['message'] as String;
      if (body is Map && body['message'] is List) {
        return (body['message'] as List).join(', ');
      }
    } catch (_) {
      // response wasn't JSON — fall through to the generic message below
    }
    return 'Something went wrong. Please try again.';
  }

  Future<LoginResponse> login(String identifier, String password) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/api/v1/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'identifier': identifier, 'password': password}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(_errorMessage(res), res.statusCode);
    }

    return LoginResponse.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<List<ChildSummary>> meChildren(String accessToken) async {
    final res = await _client.get(
      Uri.parse('$baseUrl/api/v1/me/children'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(_errorMessage(res), res.statusCode);
    }

    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => ChildSummary.fromJson(e as Map<String, dynamic>)).toList();
  }
}
