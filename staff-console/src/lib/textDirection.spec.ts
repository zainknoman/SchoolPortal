import { describe, it, expect } from 'vitest';
import { detectDirection } from './textDirection';

describe('detectDirection', () => {
  it('detects Urdu script as rtl', () => {
    expect(detectDirection('برائے مہربانی کتاب لائیں')).toBe('rtl');
  });

  it('detects English as ltr', () => {
    expect(detectDirection('Please bring your book.')).toBe('ltr');
  });

  it('uses the FIRST strong-directionality character when scripts are mixed', () => {
    expect(detectDirection('Homework: مکمل کریں')).toBe('ltr');
    expect(detectDirection('ہوم ورک: complete it')).toBe('rtl');
  });

  it('falls back to ltr for digits/punctuation-only text', () => {
    expect(detectDirection('12/08/2026')).toBe('ltr');
  });
});
