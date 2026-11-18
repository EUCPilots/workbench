import { readFileSync } from 'node:fs';

export interface WinGetPackage {
  id: string;
  name: string;
  publisher: string;
  architectures: string[];
}

export interface WinGetMapping {
  match: 'high' | 'medium' | 'override' | null;
  packages: WinGetPackage[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPackage(value: unknown): value is WinGetPackage {
  return isObject(value)
    && typeof value.id === 'string'
    && /^[a-z0-9][a-z0-9_+-]*(?:\.[a-z0-9][a-z0-9_+-]*)+(?![\s\S])/i.test(value.id)
    && typeof value.name === 'string'
    && typeof value.publisher === 'string'
    && Array.isArray(value.architectures)
    && value.architectures.every((architecture) => typeof architecture === 'string');
}

export function loadWinGetMappings(path: string): Map<string, WinGetMapping> {
  try {
    const data: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (!isObject(data) || data.schemaVersion !== 1 || !isObject(data.applications)) {
      throw new Error('Expected an AppTracker mapping with schemaVersion 1 and an applications object');
    }

    const mappings = new Map<string, WinGetMapping>();
    for (const [name, entry] of Object.entries(data.applications)) {
      const key = name.toLowerCase();
      if (!key || mappings.has(key) || !isObject(entry)) {
        throw new Error(`Invalid or duplicate Evergreen key: ${name}`);
      }

      const { match, winget } = entry;
      if ((match !== 'high' && match !== 'medium' && match !== 'override' && match !== null)
        || !Array.isArray(winget) || !winget.every(isPackage)
        || (match === null && winget.length !== 0)
        || ((match === 'high' || match === 'medium') && winget.length === 0)) {
        throw new Error(`Invalid WinGet mapping for ${name}`);
      }

      const packages = new Map<string, WinGetPackage>();
      for (const { id, name, publisher, architectures } of winget) {
        packages.set(id.toLowerCase(), { id, name, publisher, architectures });
      }
      mappings.set(key, { match, packages: [...packages.values()] });
    }
    return mappings;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`WinGet mappings unavailable at ${path}: ${reason}. Building without WinGet metadata.`);
    return new Map();
  }
}
