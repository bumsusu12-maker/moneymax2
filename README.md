# MONEYMAX V16.6.3 BRANCH PROFILE STABLEFIX

- 기존 v16.6 용산/RUB 유지
- 지점 선택/즐겨찾기/프로필 중복 스크립트 제거
- branchList DOM 제거 버그 수정
- 프로필별 지점 선택/즐겨찾기 저장
- 보조지표 프로필별 저장
- node --check 통과

{
  "base": "moneymax-v16-6-yongsan-rub.zip",
  "removed_v159_scripts": true,
  "stablefix_inserted": true,
  "branchList_preserved": true,
  "node_check": true
}

## v16.6.5
- 동대문 새 API 적용: `dongdaemun`
- 기존 v16.6.4 UI/프로필/즐겨찾기 및 다른 지점 설정 유지


## v16.6.6 TOP10 lag fix
- TOP3 → TOP10 열기/닫기 시 전체 `renderBoard()` 재생성 제거
- 클릭한 통화 카드의 `open` 클래스만 변경
- 숨겨진 전체 순위 영역에 브라우저 렌더링 최적화 적용
- v16.6.5의 새 API/동대문/기존 UI 기능 유지


## v16.7 API status/config
- 부산역 `busan-stn`
- 광장시장 `gwangjang-market`
- 이태원 `itaewon`
- 부평 `bupyeong`
- 마포 `mapo`
- 수원 `suwon`
- 송도 `songdo`
- 안양 신규 `anyang-beomgye-stn`
- 안국 신규 `anguk-stn`
- 지점 설정을 `branch-config.json` 한 곳으로 통합
- `/api/rates` 응답에 지점별 수집 상태(`branchStatus`) 추가
- 관리자 설정에 지점 수집 상태 패널 추가
- 환율 값이 바뀌지 않은 자동 갱신은 전체 카드/표 재렌더 생략
- v16.6.6 TOP10 렉 수정 유지

아직 기존 방식 유지: 서울역 / 대구 / 제주 / 제주동문 / 울산


## v16.8 Cloudflare Pages
- Cloudflare Pages + Pages Functions 배포 구조 추가
- `/api/rates`, `/api/markets`는 Cloudflare Functions에서 실행
- `/api/*`만 Function invocation 되도록 `_routes.json` 추가
- Cloudflare Functions용 지점 설정을 `functions/_shared/branches.js`로 분리
- 기존 v16.7 UI / TOP10 렉 수정 / 새 API 지점 설정 유지
- 자세한 배포 순서는 `CLOUDFLARE-DEPLOY.md` 참고


## v16.8.1 indicator + logo fix
- 보조지표 체크 해제 시 상단 요약 카드도 즉시 숨김
- 원달러/원엔/달러엔/테더 모두 동일 체크 상태 사용
- 프로필에서 복원된 보조지표 설정도 상단 카드에 반영
- `/api/rates` 정상 갱신 때 MONEYMAX 로고가 한 바퀴 백덤블링
- 기존 Cloudflare Pages 구조 및 TOP10 성능 수정 유지


## v16.8.2 Cloudflare Workers
- Pages Functions 방식 대신 Workers + Static Assets 방식으로 전환
- `npx wrangler deploy` 직접 배포 가능
- `/api/*`만 Worker 우선 실행
- 메인 화면/로고 등은 `public/` Static Assets로 배포
- v16.8.1 보조지표 체크 수정 및 로고 백덤블링 유지


## v16.8.4 market indicator fix
- Cloudflare `/api/markets` 응답에 USD/KRW, JPY/KRW, USDT/KRW 복구
- TradingView 1회 스캔 + Yahoo fallback
- JPY/KRW 직접 값이 없으면 USD/KRW ÷ USD/JPY × 100으로 계산
- USDT/KRW는 Upbit KRW-USDT 사용
- `source=investing` 선택 시 핵심 3개 FX는 Investing 우선 + fallback
- `npm run dev`와 `npm run dev:cloudflare` 둘 다 로컬 실행 가능
