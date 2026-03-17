import type { APIRoute } from 'astro';
import { basename } from 'node:path';
import { execSync } from 'node:child_process';

interface AppVersion {
  Version?: string;
  Type?: string;
  Architecture?: string;
  Language?: string;
  URI?: string;
  Size?: number;
  [key: string]: unknown;
}

// Load all JSON files at build time
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
    const output = execSync(
      'git log --pretty=format:"DATE %cI" --name-only -- json/',
      { encoding: 'utf-8', cwd: process.cwd(), stdio: ['pipe', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }
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

const dateMap = buildDateMapFromGit();

export const GET: APIRoute = () => {
  const apps = Object.entries(modules)
    .map(([path, mod]) => {
      const name = basename(path, '.json').replace('/json/', '');
      const lastUpdated = dateMap.get(name.toLowerCase()) ?? null;
      return { name, versions: mod.default ?? [], lastUpdated };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const appCount = apps.length;
  const versionCount = apps.reduce((sum, a) => sum + a.versions.length, 0);

  const payload = {
    meta: {
      appCount,
      versionCount,
      generatedAt: new Date().toISOString(),
    },
    apps,
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
};
