import 'package:go_router/go_router.dart';
import '../auth/auth_state.dart';
import '../screens/login_screen.dart';
import '../screens/home_shell.dart';

GoRouter buildAppRouter(AuthState auth) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: auth,
    redirect: (context, state) {
      final loggingIn = state.matchedLocation == '/login';

      if (!auth.isAuthenticated) {
        return loggingIn ? null : '/login';
      }
      if (loggingIn) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/home', builder: (context, state) => const HomeShell()),
      GoRoute(path: '/calendar', builder: (context, state) => const HomeShell(initialTab: 1)),
      GoRoute(path: '/notifications', builder: (context, state) => const HomeShell(initialTab: 2)),
      GoRoute(path: '/messages', builder: (context, state) => const HomeShell(initialTab: 3)),
      GoRoute(path: '/fees', builder: (context, state) => const HomeShell(initialTab: 4)),
      GoRoute(path: '/more', builder: (context, state) => const HomeShell(initialTab: 5)),
    ],
  );
}
