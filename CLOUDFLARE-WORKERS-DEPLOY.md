# MONEYMAX v16.8.6 — Cloudflare 배포

이번 버전은 Worker 엔트리 파일을 저장소 최상단으로 옮겼습니다.

Cloudflare 설정:
- 빌드 명령: 없음
- 배포 명령: `npx wrangler deploy`
- 루트 디렉터리: `/`

GitHub 저장소 최상단에 아래가 직접 보여야 합니다:

- `worker.js`
- `wrangler.jsonc`
- `package.json`
- `public/`

중요:
ZIP 파일 자체를 GitHub에 올리는 것이 아니라, ZIP을 푼 뒤 **안쪽 내용물 전체**를 저장소 최상단에 올려야 합니다.

정상 배포 후:
- `/api/health` → JSON에 `"version":"16.8.6"`
- `/api/rates` → 환율 JSON
- `/api/markets` → 보조지표 JSON
