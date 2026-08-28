import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Same tokens as the staff console (design-system/seeds-staff-console/MASTER.md) — one brand
/// across both clients, adapted to Material for a mobile surface.
class AppColors {
  static const primary = Color(0xFF0F172A);
  static const accent = Color(0xFF0369A1);
  static const background = Color(0xFFF8FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const text = Color(0xFF1E293B);
  static const muted = Color(0xFF64748B);
  static const border = Color(0xFFE2E8F0);
  static const destructive = Color(0xFFDC2626);
  static const present = Color(0xFF15803D);
  static const lateStatus = Color(0xFFB45309);
}

ThemeData buildAppTheme() {
  final colorScheme = ColorScheme.fromSeed(
    seedColor: AppColors.accent,
    primary: AppColors.accent,
    surface: AppColors.surface,
    error: AppColors.destructive,
    brightness: Brightness.light,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: AppColors.background,
    textTheme: GoogleFonts.plusJakartaSansTextTheme(),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.primary,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.border),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.surface,
      indicatorColor: AppColors.accent.withValues(alpha: 0.12),
    ),
  );
}
