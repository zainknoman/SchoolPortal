import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:parent_app/src/api/api_client.dart';
import 'package:parent_app/src/auth/auth_state.dart';
import 'package:parent_app/src/auth/token_store.dart';

void main() {
  late InMemoryTokenStore store;

  setUp(() {
    store = InMemoryTokenStore();
  });

  ApiClient okClient() {
    return ApiClient(
      baseUrl: 'http://test',
      client: MockClient((request) async {
        if (request.url.path == '/api/v1/auth/login') {
          return http.Response(
            jsonEncode({'accessToken': 'access-1', 'refreshToken': 'refresh-1', 'role': 'PARENT'}),
            200,
          );
        }
        return http.Response('not found', 404);
      }),
    );
  }

  ApiClient unauthorizedClient() {
    return ApiClient(
      baseUrl: 'http://test',
      client: MockClient((request) async {
        return http.Response(jsonEncode({'message': 'Invalid credentials'}), 401);
      }),
    );
  }

  test('starts logged out', () {
    final auth = AuthState(api: okClient(), tokenStore: store);
    expect(auth.isAuthenticated, isFalse);
    expect(auth.role, isNull);
  });

  test('logs in, stores tokens in the token store, and marks the session authenticated', () async {
    final auth = AuthState(api: okClient(), tokenStore: store);

    await auth.login('parent-a@seeds.edu.pk', 'ChangeMe123!');

    expect(auth.isAuthenticated, isTrue);
    expect(auth.role, 'PARENT');
    expect(await store.read('accessToken'), 'access-1');
    expect(await store.read('refreshToken'), 'refresh-1');
  });

  test('restoreSession() re-authenticates from persisted tokens without a network call', () async {
    await store.write('accessToken', 'persisted-access');
    await store.write('refreshToken', 'persisted-refresh');
    await store.write('role', 'PARENT');

    final auth = AuthState(api: okClient(), tokenStore: store);
    await auth.restoreSession();

    expect(auth.isAuthenticated, isTrue);
    expect(auth.role, 'PARENT');
  });

  test('surfaces the generic auth error unmodified and stays logged out on failure', () async {
    final auth = AuthState(api: unauthorizedClient(), tokenStore: store);

    await expectLater(
      auth.login('parent-a@seeds.edu.pk', 'wrong'),
      throwsA(isA<ApiException>().having((e) => e.message, 'message', 'Invalid credentials')),
    );
    expect(auth.isAuthenticated, isFalse);
  });

  test('logout clears both in-memory state and the token store', () async {
    final auth = AuthState(api: okClient(), tokenStore: store);
    await auth.login('parent-a@seeds.edu.pk', 'ChangeMe123!');

    await auth.logout();

    expect(auth.isAuthenticated, isFalse);
    expect(auth.role, isNull);
    expect(await store.read('accessToken'), isNull);
  });
}
