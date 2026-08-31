# MONEYMAX Cloudflare Pages 배포 가이드

이 버전의 실제 배포 서버는 `server.js`가 아니라 Cloudflare Pages Functions입니다.

## Cloudflare에서 GitHub로 처음 배포

1. 이 ZIP의 **내용물 전체**를 GitHub 저장소 루트에 올립니다.
   - `index.html`
   - `functions/`
   - `_routes.json`
   - 이미지 파일들
   - `package.json`
   등이 저장소 최상단에 보여야 합니다.
2. Cloudflare에 로그인합니다.
3. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**으로 이동합니다.
4. GitHub를 연결하고 MONEYMAX 저장소를 선택합니다.
5. Production branch는 보통 `main`을 선택합니다.
6. Build 설정:
   - Framework preset: `None`
   - Build command: `exit 0`
   - Build output directory: `.`
7. Save and Deploy를 누릅니다.
8. 배포가 끝나면 `프로젝트명.pages.dev` 주소가 생성됩니다.
9. 먼저 아래 3개를 확인합니다.
   - `/` : MONEYMAX 화면
   - `/api/rates` : JSON 응답
   - `/api/markets` : JSON 응답
10. 이후 GitHub `main`에 파일을 push하면 Cloudflare가 자동 재배포합니다.

## 로컬에서 Cloudflare 방식으로 테스트

Node.js가 설치된 폴더에서:

```bash
npm install
npm run dev:cloudflare
```

기본적으로 Wrangler가 로컬 주소를 출력합니다. 브라우저에서 그 주소를 열면
정적 화면과 `/api/*` Functions를 함께 테스트할 수 있습니다.

## 구조

- `index.html` : 프론트 화면
- `functions/api/rates.js` : `/api/rates`
- `functions/api/markets.js` : `/api/markets`
- `functions/_shared/branches.js` : Cloudflare용 지점/API 코드 설정
- `_routes.json` : `/api/*`만 Function을 실행하도록 제한
- `server.js`, `render.yaml`, `branch-config.json` : 기존 Render/로컬 이력 보존용. Cloudflare Pages 운영에는 사용하지 않음.

## 중요

Cloudflare 대시보드의 단순 Drag & Drop은 `/functions` 폴더를 Pages Functions로 컴파일하지 않습니다.
이 프로젝트는 GitHub 연결 방식으로 배포하는 것을 권장합니다.
