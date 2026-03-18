import type { APIRoute, GetStaticPaths } from 'astro';
import { getApps, type AppRecord, type AppVersion } from '../../lib/appData';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildItemTitle(displayName: string, v: AppVersion): string {
  const parts = [displayName];
  if (v.Version) parts.push(String(v.Version));
  const sub: string[] = [];
  if (v.Architecture) sub.push(String(v.Architecture));
  if (v.Type) sub.push(String(v.Type));
  if (v.Language && v.Language !== 'en' && v.Language !== 'neutral') sub.push(String(v.Language));
  if (sub.length) parts.push(`(${sub.join(', ')})`);
  return parts.join(' ');
}

function buildItemDescription(v: AppVersion): string {
  const rows: string[] = [];
  if (v.Version) rows.push(`<strong>Version:</strong> ${escapeXml(String(v.Version))}`);
  if (v.Architecture) rows.push(`<strong>Architecture:</strong> ${escapeXml(String(v.Architecture))}`);
  if (v.Type) rows.push(`<strong>Type:</strong> ${escapeXml(String(v.Type))}`);
  if (v.Language) rows.push(`<strong>Language:</strong> ${escapeXml(String(v.Language))}`);
  if (v.URI) rows.push(`<strong>URI:</strong> <a href="${escapeXml(String(v.URI))}">${escapeXml(String(v.URI))}</a>`);
  if (v.Size != null) rows.push(`<strong>Size:</strong> ${escapeXml(String(v.Size))}`);
  return rows.join('<br/>');
}

function buildFeedXml(app: AppRecord, siteBase: string): string {
  const feedUrl = `${siteBase}feeds/${app.name}.xml`;
  const appUrl = `${siteBase}#${app.name}`;
  const pubDate = app.lastUpdated ? new Date(app.lastUpdated).toUTCString() : new Date().toUTCString();

  const items = app.versions.map((v, i) => {
    const title = escapeXml(buildItemTitle(app.displayName, v));
    const link = escapeXml(appUrl);
    const guidParts = [app.name, String(v.Version ?? ''), String(v.Architecture ?? ''), String(v.Type ?? ''), String(i)];
    const guid = escapeXml(`${feedUrl}#${guidParts.filter(Boolean).join('-')}`);
    const description = `<![CDATA[${buildItemDescription(v)}]]>`;

    // Only emit <enclosure> when URI and a valid numeric Size are both present
    const sizeNum = typeof v.Size === 'number'
      ? v.Size
      : typeof v.Size === 'string'
        ? parseInt(v.Size, 10)
        : NaN;
    const enclosure = v.URI && !isNaN(sizeNum) && sizeNum > 0
      ? `\n      <enclosure url="${escapeXml(String(v.URI))}" length="${sizeNum}" type="application/octet-stream" />`
      : '';

    return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>${enclosure}
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(app.displayName)} — Evergreen Workbench</title>
    <link>${escapeXml(appUrl)}</link>
    <description>Current download versions for ${escapeXml(app.displayName)} tracked by the Evergreen PowerShell module.</description>
    <language>en</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <generator>Evergreen Workbench (Astro)</generator>${items}
  </channel>
</rss>`;
}

export const getStaticPaths: GetStaticPaths = () => {
  return getApps().map((app) => ({
    params: { app: app.name },
    props: { appRecord: app },
  }));
};

export const GET: APIRoute<{ appRecord: AppRecord }> = ({ props }) => {
  // import.meta.env.SITE = "https://eucpilots.com"
  // import.meta.env.BASE_URL = "/workbench" — normalise to always have trailing slash
  const rawBase = import.meta.env.BASE_URL as string;
  const base = rawBase.endsWith('/') ? rawBase : rawBase + '/';
  const siteBase = `${import.meta.env.SITE}${base}`;
  const xml = buildFeedXml(props.appRecord, siteBase);
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
