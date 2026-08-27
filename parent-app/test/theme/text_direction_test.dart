import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:parent_app/src/theme/text_direction.dart';

void main() {
  test('detects Urdu script as rtl', () {
    expect(detectDirection('برائے مہربانی کتاب لائیں'), TextDirection.rtl);
  });

  test('detects English as ltr', () {
    expect(detectDirection('Please bring your book.'), TextDirection.ltr);
  });

  test('uses the FIRST strong-directionality character when scripts are mixed', () {
    expect(detectDirection('Homework: مکمل کریں'), TextDirection.ltr);
    expect(detectDirection('ہوم ورک: complete it'), TextDirection.rtl);
  });

  test('falls back to ltr for digits/punctuation-only text', () {
    expect(detectDirection('12/08/2026'), TextDirection.ltr);
  });

  testWidgets('DirectionalText renders Urdu text right-to-left', (tester) async {
    await tester.pumpWidget(
      const Directionality(textDirection: TextDirection.ltr, child: DirectionalText('برائے مہربانی')),
    );
    final directionality = tester
        .widgetList<Directionality>(find.byType(Directionality))
        .last;
    expect(directionality.textDirection, TextDirection.rtl);
  });
}
