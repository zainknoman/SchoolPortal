import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Abstracted so tests can supply an in-memory fake instead of hitting the platform's real
/// Keystore/Keychain (which isn't available in the widget-test environment).
abstract class TokenStore {
  Future<void> write(String key, String value);
  Future<String?> read(String key);
  Future<void> delete(String key);
}

class SecureTokenStore implements TokenStore {
  final _storage = const FlutterSecureStorage();

  @override
  Future<void> write(String key, String value) => _storage.write(key: key, value: value);

  @override
  Future<String?> read(String key) => _storage.read(key: key);

  @override
  Future<void> delete(String key) => _storage.delete(key: key);
}

class InMemoryTokenStore implements TokenStore {
  final _values = <String, String>{};

  @override
  Future<void> write(String key, String value) async => _values[key] = value;

  @override
  Future<String?> read(String key) async => _values[key];

  @override
  Future<void> delete(String key) async => _values.remove(key);
}
