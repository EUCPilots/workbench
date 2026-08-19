import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normalizeVersions, type AppVersion } from './appData';

function relativeLuminance(hex: string) {
  const value = hex.replace('#', '').trim();
  const normalized = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value;

  const rgb = [0, 1, 2].map((index) => parseInt(normalized.slice(index * 2, index * 2 + 2), 16) / 255);
  const linear = rgb.map((channel) => channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(hexA: string, hexB: string) {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

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

describe('onboarding guidance', () => {
  it('explains the core value and next steps for first-time users', () => {
    const source = readFileSync(new URL('../components/AppsPage.tsx', import.meta.url), 'utf8');

    expect(source).toContain('Welcome to Evergreen Workbench');
    expect(source).toContain('Pin apps');
    expect(source).toContain('Press / to search');
  });
});

describe('brand colors', () => {
  it('uses a green text color that passes WCAG AA on white backgrounds', () => {
    const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
    const match = css.match(/--colorBrandForeground1:\s*(#[0-9a-fA-F]{6})/);

    expect(match).not.toBeNull();

    const green = (match?.[1] ?? '#000000').toLowerCase();
    expect(contrastRatio(green, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('uses a dark green background that keeps secondary text readable in dark mode', () => {
    const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
    const darkBlock = css.match(/\[data-theme="dark"\][\s\S]*?\}/);
    const backgroundMatch = darkBlock?.[0].match(/--colorBrandBackground:\s*(#[0-9a-fA-F]{6})/);
    const secondaryTextMatch = darkBlock?.[0].match(/--colorNeutralForeground2:\s*(#[0-9a-fA-F]{6})/);

    expect(darkBlock).not.toBeNull();
    expect(backgroundMatch).not.toBeNull();
    expect(secondaryTextMatch).not.toBeNull();

    const background = (backgroundMatch?.[1] ?? '#000000').toLowerCase();
    const secondaryText = (secondaryTextMatch?.[1] ?? '#000000').toLowerCase();
    expect(contrastRatio(background, secondaryText)).toBeGreaterThanOrEqual(4.5);
  });

  it('labels the listbox and dialog widgets for assistive technologies', () => {
    const sidebarSource = readFileSync(new URL('../components/AppsSidebar.tsx', import.meta.url), 'utf8');
    const searchSource = readFileSync(new URL('../components/GlobalSearch.tsx', import.meta.url), 'utf8');

    expect(sidebarSource).toContain('role="listbox"');
    expect(sidebarSource).toContain('aria-labelledby="apps-list-label"');
    expect(searchSource).toContain('role="dialog"');
    expect(searchSource).toContain('aria-labelledby="global-search-title"');
  });
});
