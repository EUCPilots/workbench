import type { APIRoute } from 'astro';
import { getApps } from '../lib/appData';

export const GET: APIRoute = () => {
  const apps = getApps();
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
