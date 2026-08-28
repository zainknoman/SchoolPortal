import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:parent_app/src/theme/app_theme.dart';

void main() {
  test('present and late status colors match the staff-console design tokens', () {
    expect(AppColors.present, const Color(0xFF15803D));
    expect(AppColors.lateStatus, const Color(0xFFB45309));
  });
}
