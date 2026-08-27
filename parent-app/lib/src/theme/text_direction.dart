import 'package:flutter/widgets.dart';
import 'package:google_fonts/google_fonts.dart';

// Arabic, Arabic Supplement, Arabic Extended-A, Arabic Presentation Forms A/B — covers Urdu.
final _rtlRange = RegExp(r'[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-ﻼ]');
final _latinRange = RegExp(r'[A-Za-z]');

/// First strong-directionality character decides the block's direction — same rule as the
/// staff-console's detectDirection (src/lib/textDirection.ts), ported to Dart. No language
/// detection/translation, just script detection.
TextDirection detectDirection(String text) {
  for (final rune in text.runes) {
    final char = String.fromCharCode(rune);
    if (_rtlRange.hasMatch(char)) return TextDirection.rtl;
    if (_latinRange.hasMatch(char)) return TextDirection.ltr;
  }
  return TextDirection.ltr;
}

/// A Text widget that auto-switches direction and font per [detectDirection] — Urdu renders
/// right-to-left in Noto Nastaliq Urdu, everything else stays the app's default font/direction.
class DirectionalText extends StatelessWidget {
  const DirectionalText(this.text, {super.key, this.style});

  final String text;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    final direction = detectDirection(text);
    final effectiveStyle = direction == TextDirection.rtl
        ? GoogleFonts.notoNastaliqUrdu(textStyle: style, fontSize: (style?.fontSize ?? 14) * 1.15)
        : style;

    return Directionality(textDirection: direction, child: Text(text, style: effectiveStyle));
  }
}
