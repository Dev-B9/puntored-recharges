import { AmountRangeValidator } from './validators/amount-range.validator';
import { PhoneNumberFormatValidator } from './validators/phone-number-format.validator';

describe('AmountRangeValidator', () => {
  const v = new AmountRangeValidator();

  it('returns true for undefined or null', () => {
    expect(v.validate(undefined)).toBe(true);
    expect(v.validate(null)).toBe(true);
  });

  it('returns true for non-number (delegates to type validators)', () => {
    expect(v.validate('abc' as any)).toBe(true);
    expect(v.validate(12.34 as any)).toBe(true); // non-integer -> true (type error handled elsewhere)
  });

  it('validates numbers inside range', () => {
    expect(v.validate(1000)).toBe(true);
    expect(v.validate(50000)).toBe(true);
    expect(v.validate(100000)).toBe(true);
  });

  it('invalidates numbers outside range', () => {
    expect(v.validate(999)).toBe(false);
    expect(v.validate(100001)).toBe(false);
  });
});

describe('PhoneNumberFormatValidator', () => {
  const v = new PhoneNumberFormatValidator();

  it('returns true for undefined/null/empty or non-string (delegates)', () => {
    expect(v.validate(undefined)).toBe(true);
    expect(v.validate(null)).toBe(true);
    expect(v.validate('')).toBe(true);
    expect(v.validate(123 as any)).toBe(true);
  });

  it('validates correct phone format', () => {
    expect(v.validate('3101234567')).toBe(true);
  });

  it('invalidates wrong formats', () => {
    expect(v.validate('2101234567')).toBe(false);
    expect(v.validate('310123')).toBe(false);
  });
});
