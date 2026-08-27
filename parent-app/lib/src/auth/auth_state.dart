import 'package:flutter/foundation.dart';
import '../api/api_client.dart';
import 'token_store.dart';

/// Parent app's session state — deliberately mirrors staff-console's Pinia auth store so the two
/// clients behave the same way against the same backend contract.
class AuthState extends ChangeNotifier {
  AuthState({required ApiClient api, required TokenStore tokenStore})
    : _api = api,
      _tokenStore = tokenStore;

  final ApiClient _api;
  final TokenStore _tokenStore;

  String? _accessToken;
  String? _role;

  bool get isAuthenticated => _accessToken != null;
  String? get role => _role;
  String? get accessToken => _accessToken;

  /// Called once at app start — restores a session from secure storage so the parent isn't
  /// forced to log in again every time the app opens (FEAT-005 acceptance criteria).
  Future<void> restoreSession() async {
    final accessToken = await _tokenStore.read('accessToken');
    final role = await _tokenStore.read('role');
    if (accessToken != null && role != null) {
      _accessToken = accessToken;
      _role = role;
      notifyListeners();
    }
  }

  Future<void> login(String identifier, String password) async {
    // Errors propagate to the caller (LoginScreen) unmodified — this state layer must not add or
    // remove information from the generic auth error.
    final session = await _api.login(identifier, password);

    _accessToken = session.accessToken;
    _role = session.role;

    await _tokenStore.write('accessToken', session.accessToken);
    await _tokenStore.write('refreshToken', session.refreshToken);
    await _tokenStore.write('role', session.role);

    notifyListeners();
  }

  Future<void> logout() async {
    _accessToken = null;
    _role = null;

    await _tokenStore.delete('accessToken');
    await _tokenStore.delete('refreshToken');
    await _tokenStore.delete('role');

    notifyListeners();
  }
}
