export type Project = {
  id: string;
  title: string;
  type: string;
  format: string;
  category?: string;
  source: string;
  url: string;
  coverUrl?: string;
  description?: string;
  published: boolean;
  sample: boolean;
};

type Media = { kind: 'instagram'; url: string; embedUrl: string }
  | { kind: 'video'; url: string }
  | { kind: 'unavailable' };

// Normalize share links without copying tracking parameters or injecting embed HTML.
export function resolveMedia(project: Pick<Project, 'source' | 'url' | 'sample'>): Media {
  if (project.sample || !project.url.trim()) return { kind: 'unavailable' };
  try {
    if (project.source === 'instagram') {
      const url = new URL(project.url.trim());
      if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(url.hostname)) {
        return { kind: 'unavailable' };
      }
      const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/);
      if (!match) return { kind: 'unavailable' };
      const canonical = `https://www.instagram.com/${match[1]}/${match[2]}/`;
      return { kind: 'instagram', url: canonical, embedUrl: `${canonical}embed/` };
    }
    if (project.source === 'video') {
      // Allow project-owned media paths and HTTPS-hosted video sources only.
      if (/^\/media\/[A-Za-z0-9_./-]+$/.test(project.url) && !project.url.includes('..')) {
        return { kind: 'video', url: project.url };
      }
      const url = new URL(project.url.trim());
      if (url.protocol === 'https:' && !url.username && !url.password) return { kind: 'video', url: url.href };
    }
  } catch { /* Invalid or unsupported media is presented as unavailable. */ }
  return { kind: 'unavailable' };
}
