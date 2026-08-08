import { describe, expect, it } from 'vitest';
import { normalizeVersions, type AppVersion } from './appData';

describe('normalizeVersions', () => {
  it('returns arrays unchanged', () => {
    const versions: AppVersion[] = [{ Version: '1.0.0' }, { Version: '2.0.0' }];
    const result = normalizeVersions(versions);

    expect(result).toBe(versions);
    expect(result).toHaveLength(2);
  });

  it('wraps a single object in an array', () => {
    const version: AppVersion = { Version: '1.0.0', Type: 'msi' };

    expect(normalizeVersions(version)).toEqual([version]);
  });

  it('returns an empty array for nullish values', () => {
    expect(normalizeVersions(null)).toEqual([]);
    expect(normalizeVersions(undefined)).toEqual([]);
  });

  it('returns an empty array for non-object values', () => {
    expect(normalizeVersions('1.0.0' as unknown as AppVersion)).toEqual([]);
    expect(normalizeVersions(42 as unknown as AppVersion)).toEqual([]);
  });
});
