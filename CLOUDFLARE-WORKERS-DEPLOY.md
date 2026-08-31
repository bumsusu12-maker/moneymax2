# MONEYMAX v16.8.3 — Cloudflare Workers 배포

이 버전은 Cloudflare **Workers + Static Assets** 전용입니다.

## Cloudflare GitHub 자동 배포 설정

현재 프로젝트의 배포 설정은 아래처럼 사용하면 됩니다.

- 빌드 명령: 없음
- 배포 명령: `npx wrangler deploy`
- 루트 디렉터리: `/`

`wrangler.jsonc`가 배포 설정의 기준입니다.

## GitHub에 올릴 파일

ZIP 안의 내용 전체를 저장소 루트에 올립니다.

특히 아래가 최상단에 있어야 합니다.

- `wrangler.jsonc`
- `package.json`
- `src/worker.js`
- `public/index.html`
- `public/logo-light.png`
- 기타 public 이미지

## 배포 후 확인

1. 메인 `*.workers.dev` 주소
2. `/api/rates`
3. `/api/markets`

## 로컬 테스트

```cmd
npm install
npm run dev
```

Wrangler가 출력한 localhost 주소를 브라우저에서 엽니다.

## 구조

- `public/` : 정적 웹 화면/이미지
- `src/worker.js` : `/api/rates`, `/api/markets` 처리
- `wrangler.jsonc` : Cloudflare Workers 배포/Static Assets 설정
- `_legacy_render_reference/` : 과거 Render 서버 참고용. 운영에는 사용하지 않음.

### v16.8.3 수정
- Worker 라우터가 존재하지 않는 `handleRates`/`handleMarkets`를 호출하던 오류 수정
- 실제 `handleRatesGet()` / `handleMarketsGet()` 호출
- `/api/*` 미등록 경로는 HTML 대신 JSON 404 반환


## v16.8.4 market indicator fix
- Cloudflare `/api/markets` 응답에 USD/KRW, JPY/KRW, USDT/KRW 복구
- TradingView 1회 스캔 + Yahoo fallback
- JPY/KRW 직접 값이 없으면 USD/KRW ÷ USD/JPY × 100으로 계산
- USDT/KRW는 Upbit KRW-USDT 사용
- `source=investing` 선택 시 핵심 3개 FX는 Investing 우선 + fallback
- `npm run dev`와 `npm run dev:cloudflare` 둘 다 로컬 실행 가능

## v16.8.5 Cloud routing hard-fix

- `assets.run_worker_first: true`
  - Cloudflare에서 `/api/*`가 SPA의 `index.html`로 먹히는 상황을 구조적으로 차단
  - 모든 요청이 Worker를 먼저 거치고, 일반 화면/이미지만 `env.ASSETS.fetch()`로 전달
- `/api/health` 추가
  - 정상 배포 확인 URL: `https://배포주소/api/health`
  - 반드시 JSON으로 `"version":"16.8.5"`가 보여야 함
- API 예외도 HTML 대신 JSON 500으로 반환
- 프론트에서도 API가 HTML을 반환하면 원인을 읽을 수 있게 오류 메시지 강화

### 배포 후 가장 먼저 확인
브라우저 주소창에 `/api/health`를 붙여 접속하세요.

정상:
`{"success":true,"version":"16.8.5","runtime":"cloudflare-worker",...}`

HTML 화면이 뜬다면 v16.8.5 Worker가 아닌 다른 Pages/이전 URL을 보고 있는 것입니다.
