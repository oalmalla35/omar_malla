import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMedia } from '../src/media.ts';

const media = (source, url, sample = false) => resolveMedia({ source, url, sample });
test('Instagram share links are normalized without tracking', () => {
  assert.deepEqual(media('instagram', 'https://www.instagram.com/reel/AbC_123-xy/?igsh=tracking'), {
    kind: 'instagram', url: 'https://www.instagram.com/reel/AbC_123-xy/',
    embedUrl: 'https://www.instagram.com/reel/AbC_123-xy/embed/',
  });
  assert.equal(media('instagram', 'https://instagram.com/p/Abc123/').kind, 'instagram');
});
test('profile links and lookalike domains cannot become video embeds', () => {
  for (const url of ['https://www.instagram.com/omar.al.malla/', 'https://instagram.com.evil.com/reel/AbC/', 'javascript:alert(1)', 'https://instagram.com/reel/']) {
    assert.equal(media('instagram', url).kind, 'unavailable');
  }
});
test('real video sources and sample placeholders remain distinct', () => {
  assert.equal(media('video', '/media/event.mp4').kind, 'video');
  assert.equal(media('video', 'https://videos.example.org/event.mp4').kind, 'video');
  assert.equal(media('video', '/media/../secret.mp4').kind, 'unavailable');
  assert.equal(media('video', 'javascript:alert(1)').kind, 'unavailable');
  assert.equal(media('instagram', 'https://instagram.com/reel/ABC/', true).kind, 'unavailable');
});
