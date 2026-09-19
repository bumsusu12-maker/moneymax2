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


## v16.8.7
- 지점 선택 모달의 서울/경기·인천/지방 3열 폭을 동일하게 수정
- 즐겨찾기 클릭 시 전체 환율 보드를 즉시 재렌더링하던 병목 제거
- 지점 체크 클릭 시 전체 보드/지점목록을 매번 재생성하던 병목 제거
- 모달 안에서는 별/체크 상태만 즉시 반영하고, 모달을 닫을 때 환율 보드를 1회만 갱신
- 프로필별 즐겨찾기/지점 선택 저장은 유지


## v16.8.8
- 지점 선택 모달이 처음 열릴 때 3열 전체가 `지방` 카드 안에 한 번 더 중첩되던 문제 수정
- 원인: `renderBranchList()`가 이미 3열을 만든 뒤 구형 `groupBranchModalV158()`가 그 3열 전체를 다시 한 번 그룹화함
- 이미 `.branch-region-grid`가 있으면 구형 그룹핑 로직을 즉시 종료하도록 수정
- 서울 / 경기·인천 / 지방 3열이 모달 전체 폭을 정상적으로 나눠 사용
- v16.8.7의 즐겨찾기/체크 렉 개선 유지


## v16.8.9
- 즐겨찾기 지점의 환율 순위 파란색 강조 복구
- 순위 렌더링이 삭제된 구형 즐겨찾기 헬퍼를 참조하던 문제 수정
- 현재 즐겨찾기 상태인 `isFocused(branch)`를 사용하도록 통일
- 기존 지점 선택 렉 개선/모달 중첩 수정 유지


## v16.8.10
신형 M-BOX API 지점 업데이트:
- 제주 → `jeju`
- 제주동문 → `jeju-dongmun-market`
- 울산 → `ulsan-samsan`
- 대구 → `daegu`
- 창원 신규 추가 → `changwon`
- 김해공항 신규 추가 → `gimhae-airport`

기존 v16.8.9의 즐겨찾기 파란 강조, 지점 선택 모달/렉 개선, Cloudflare Worker 구조는 그대로 유지.


## v16.8.11
- 서울역 신형 M-BOX API 전환 → `seoul-stn`
- 이로써 기존 관리 대상 MONEYBOX 지점의 신형 API 코드 전환 완료
- v16.8.10 이하 UI/즐겨찾기/Cloudflare Worker 수정 유지
