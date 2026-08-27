// Arabic, Arabic Supplement, Arabic Extended-A, Arabic Presentation Forms A/B — covers Urdu.
const RTL_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-ﻼ]/;
const LATIN_RANGE = /[A-Za-z]/;

export type TextDirection = 'ltr' | 'rtl';

/**
 * First strong-directionality character decides the whole block's direction (Unicode bidi
 * paragraph-direction rule) — pure script detection, no language identification or translation.
 */
export function detectDirection(text: string): TextDirection {
  for (const char of text) {
    if (RTL_RANGE.test(char)) return 'rtl';
    if (LATIN_RANGE.test(char)) return 'ltr';
  }
  return 'ltr';
}
