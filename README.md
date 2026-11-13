# 우리반 바탕화면 (수정판)

원본: 김맨 「우리반 바탕화면」 https://kimman.kr/desk · CC BY-SA 4.0
고친 것:
- 오늘의 한마디 카드, 오늘 내 마음 기능 삭제
- 선생님 서랍을 새 창(팝업)으로 열기 — 전자칠판 화면에는 서랍이 뜨지 않음
- 선생님 서랍에 '수업계획' 탭 추가 (한 주 시간표 칸마다 수업 계획 · 활동 계획 기록, 찾기, 인쇄 / 시트 '수업계획' 탭에 저장)

## 설치 순서
1. 구글 클라우드 콘솔(console.cloud.google.com)에서 새 프로젝트를 만들어요.
2. API 및 서비스 → 라이브러리에서 Google Sheets API, Google Drive API를 '사용'으로 켜요.
3. OAuth 동의 화면: 사용자 유형 '외부', 앱 이름 · 이메일 입력 → 테스트 사용자에 내 Gmail 추가.
4. 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID → '웹 애플리케이션'
   승인된 JavaScript 원본: https://ttaki325-blip.github.io
5. 만들어진 클라이언트 ID를 config.js 의 clientId 에 붙여 넣어요.
6. GitHub에 새 저장소를 만들어 이 폴더의 파일을 모두 올리고, Settings → Pages → Branch: main / (root) → Save.
7. https://ttaki325-blip.github.io/저장소이름/ 으로 열고 구글로 시작해요.
8. 바탕화면에서 [선생님]을 누르면 선생님 서랍이 새 창으로 열려요. 처음 한 번은 브라우저 팝업 차단을 '항상 허용'으로 바꿔 주세요.

체험만 해 보려면 주소 끝에 ?demo 를 붙여요 (저장되지 않음).
