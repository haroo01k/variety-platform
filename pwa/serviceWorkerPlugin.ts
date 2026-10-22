import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

const BUILD_ID_PLACEHOLDER = "'__PWA_BUILD_ID__'";
const PRECACHE_PLACEHOLDER = "['__PWA_PRECACHE_ASSETS__']";

/**
 * 프로덕션 빌드 때 dist/sw.js의 자리표시자를 실제 값으로 바꿉니다.
 *  - 빌드 ID: 배포마다 sw.js 내용이 달라져 브라우저가 새 버전을 감지하고 이전 캐시를 지웁니다.
 *  - 프리캐시 목록: 이번 빌드의 해시된 JS/CSS 파일 → 첫 방문 직후부터 오프라인 실행 가능.
 * 새 패키지(vite-plugin-pwa 등) 없이 public/sw.js 하나로 관리하기 위한 최소 플러그인입니다.
 */
export function serviceWorkerPlugin(): Plugin {
  let config: ResolvedConfig;
  let assetFiles: string[] = [];

  return {
    name: 'gihu-nongsa-service-worker',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    generateBundle(_options, bundle) {
      assetFiles = Object.keys(bundle)
        .filter((fileName) => fileName.startsWith('assets/') && /\.(js|css)$/.test(fileName))
        .map((fileName) => `/${fileName}`);
    },
    async closeBundle() {
      const swPath = path.resolve(config.root, config.build.outDir, 'sw.js');
      const source = await readFile(swPath, 'utf8');
      if (!source.includes(BUILD_ID_PLACEHOLDER) || !source.includes(PRECACHE_PLACEHOLDER)) {
        throw new Error('[service-worker] public/sw.js의 자리표시자를 찾을 수 없습니다.');
      }
      const buildId = new Date().toISOString().replace(/\D/g, '');
      const output = source
        .replace(BUILD_ID_PLACEHOLDER, JSON.stringify(buildId))
        .replace(PRECACHE_PLACEHOLDER, JSON.stringify(assetFiles));
      await writeFile(swPath, output);
    },
  };
}
