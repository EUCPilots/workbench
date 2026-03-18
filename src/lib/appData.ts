import { basename, join } from 'node:path';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export interface AppVersion {
  Version?: string;
  Type?: string;
  Architecture?: string;
  Language?: string;
  URI?: string;
  Size?: number | string;
  [key: string]: unknown;
}

export interface AppRecord {
  name: string;
  displayName: string;
  versions: AppVersion[];
  lastUpdated: string | null;
}

interface SupportedApp {
  Name: string;
  Application: string;
  Link: string;
}

// Load supported-apps.json at build time.  The file is fetched from
// aaronparker/apptracker by the CI workflow; falls back to an empty map
// so local builds without the file still succeed (displayName = name).
function loadDisplayNameMap(): Map<string, string> {
  try {
    const raw = readFileSync(join(process.cwd(), 'json', 'supported-apps.json'), 'utf-8');
    return new Map<string, string>(
      (JSON.parse(raw) as SupportedApp[]).map((a) => [a.Name.toLowerCase(), a.Application])
    );
  } catch {
    return new Map();
  }
}

// Load all JSON files at build time (excluding supported-apps.json)
const modules = import.meta.glob<{ default: AppVersion[] }>('/json/*.json', { eager: true });

/**
 * Build a map of lowercase app name → ISO commit date by parsing a single
 * `git log` invocation over the entire json/ directory.  Git log is ordered
 * newest-first, so the first time we see a filename it is its most-recent
 * commit — we skip any later (older) occurrences.
 *
 * Falls back to an empty map if git is unavailable (e.g. a clean Docker
 * build with no git history) so the site still builds; lastUpdated will
 * simply be null for all apps in that case.
 */
function buildDateMapFromGit(): Map<string, string> {
  const map = new Map<string, string>();
  try {
    // --pretty=format:"DATE %cI" prints one "DATE <iso>" header per commit.
    // --name-only appends the list of changed files beneath each header.
    // JSON_GIT_DIR points to the cloned source repo (aaronparker/apptracker)
    // so that lastUpdated reflects that repo's commit history, not this one.
    const gitDir = process.env.JSON_GIT_DIR ?? process.cwd();
    const output = execSync(
      'git log --pretty=format:"DATE %cI" --name-only -- json/',
      { encoding: 'utf-8', cwd: gitDir, stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }
    );

    let currentDate: string | null = null;
    for (const raw of output.split('\n')) {
      const line = raw.trim();
      if (line.startsWith('DATE ')) {
        currentDate = line.slice(5).trim();
      } else if (line.startsWith('json/') && line.endsWith('.json') && currentDate) {
        const key = basename(line, '.json').toLowerCase();
        if (!map.has(key)) {
          // First occurrence = most recent commit for this file
          map.set(key, currentDate);
        }
      }
    }
  } catch {
    // git unavailable or no history — lastUpdated will be null for all apps
  }
  return map;
}

const displayNameMap = loadDisplayNameMap();
const dateMap = buildDateMapFromGit();

export function getApps(): AppRecord[] {
  return Object.entries(modules)
    .filter(([path]) => !path.endsWith('/supported-apps.json'))
    .map(([path, mod]) => {
      const name = basename(path, '.json').replace('/json/', '');
      const displayName = displayNameMap.get(name.toLowerCase()) ?? name;
      const lastUpdated = dateMap.get(name.toLowerCase()) ?? null;
      return { name, displayName, versions: mod.default ?? [], lastUpdated };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }));
}
