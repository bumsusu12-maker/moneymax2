# MONEYMAX V16.5 STABLE

지점별 환율 비교 앱의 선택기와 배포 복구판입니다.

## 수정 사항

- 누락된 지점 선택 모달 복구
- 프로필 추가·전환·이름 변경·삭제 화면 복구
- 설정 화면 복구
- 지점 라벨 중복 클릭으로 체크가 되돌아가던 문제 수정
- 프로필 이름 HTML 삽입 방지
- 서버 소스·배포 파일의 정적 노출 차단
- 상태 확인 API(`/api/health`)와 Render 배포 설정 추가

## 로컬 실행

```bash
npm ci
npm start
```

기본 주소는 `http://localhost:3001`입니다.

## Render 복구

`This service has been suspended by its owner.` 메시지는 앱 오류가 아니라 기존 Render 서비스가 정지된 상태라는 뜻입니다. 기존 서비스를 Resume 하거나, 이 폴더의 `render.yaml`로 새 Web Service를 배포하세요. Health Check 경로는 `/api/health`입니다.
