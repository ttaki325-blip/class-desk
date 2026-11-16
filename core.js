/* 우리반 바탕화면 앱판 — 주방 (GAS판 Code.gs 그대로 + overrides.js). 만든 사람 김맨 https://kimman.kr · CC BY-SA 4.0 */
window.CORE = (function () {
/**
 * 우리반 바탕화면 v2 — 백엔드 · 주방
 * 초등학교 교실 전자칠판에 하루 종일 띄워 두는 학급경영 바탕화면. 모든 기록은 이 구글 시트에 쌓입니다.
 *
 * 설치: 이 시트 → 확장 프로그램 → Apps Script → 이 코드 붙여 넣기 → [+] HTML 'index' 만들어 index.html 붙여 넣기
 *       → 함수 목록에서 setup 실행 → 권한 허용 → 배포 → 새 배포 → 웹 앱
 *       (실행: 나 / 액세스: 나만 — 교실 컴퓨터에서 선생님 구글 계정으로 열어요. '모든 사용자'로 열면 설정 탭 '화면 잠금 코드'를 꼭 정하세요)
 * 보안: 이 시트에는 학생 이름 · 출결 · 마음 기록 · 계정 비밀번호가 들어 있어요. 학생 · 학부모 · 다른 사람에게 절대 공유하지 마세요.
 * 코드를 바꾼 뒤: 배포 → 배포 관리 → 연필 → 버전: 새 버전 → 배포 (이걸 안 하면 웹 앱은 옛 코드 그대로)
 * 시트 맨 위 메뉴 '앱 설정': 예시 데이터 · 정리 · 정렬 · 보고서 · 꾸미기
 *
 * 만든 사람: 김맨 (https://kimman.kr)
 * 저작권: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/deed.ko)
 *   누구나 자유롭게 쓰고 고쳐 쓸 수 있어요. 고쳐서 나눌 때는 만든 사람을 밝히고 같은 조건(CC BY-SA)으로 나눠 주세요.
 * 학생 이름 · 계정 · 마음 · 출결 같은 개인정보는 사용하는 선생님의 구글 시트에 저장됩니다.
 *   시트 공유 · 웹 앱 공개 범위를 잘 관리해 주세요. 개인정보 관리 소홀로 생기는 문제의 책임은 사용하는 분께 있습니다.
 */

const VERSION = '우리반 바탕화면 앱판 수정판 v3.1';
// 제작자 요청함 주소 (제작자용_요청함.gs 를 웹 앱으로 배포한 주소). 비워 두면 '제작자에게' 보내기가 꺼진다
const FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycbz6lqEJfLAdC_6FlpnmC4FN3Y4rlPzu7ljjNHVjyOT7CCuSG5PL4rOExMiMqrm3GHHv/exec';

// 사람이 적거나 앱이 한 줄씩 쌓는 탭 (머리글 고정)
const TABS = {
  '설정':      ['항목', '값', '설명'],
  '학생':      ['번호', '이름', '1인 1역', '사용', '생일', '성별'],
  '계정':      ['번호', '이름', '아이톡톡 아이디', '아이톡톡 비밀번호', '아이톡톡 힌트'],   // 실제 머리글은 설정 '계정 종류'를 따라 저절로 (head_). 비밀번호는 선생님만, 화면엔 아이디 · 힌트만
  '기초시간표':  ['교시', '시각', '월', '화', '수', '목', '금'],
  '시간표변경':  ['날짜', '1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'],
  '일정':      ['날짜', '일정', '종류'],
  '명언':      ['글귀', '누가'],
  '할일':      ['번호', '날짜', '할 일', '완료'],
  '쪽지':      ['번호', '시각', '누가', '내용'],
  '선생님노트':  ['시각', '날짜', '번호', '이름', '분류', '내용'],
  '모둠':      ['모둠', '번호', '이름', '저장한 날'],
  '출결':      ['날짜', '번호', '이름', '종류', '구분', '기호', '사유', '적은 시각'],
  '학생별':    ['번호', '이름', '우유', '다 했어요', '1인 1역', '발표', '발표 누적', '최근 마음', '빨강 신호', '선생님 노트'],
  '날짜별':    ['날짜', '우유(명)', '다 했어요(명)', '1인 1역(명)', '발표(번)', '초록', '노랑', '빨강', '온도계(도)'],
  '기록':      ['시각', '날짜', '종류', '번호', '이름', '내용'],
  '감정':      ['시각', '날짜', '번호', '이름', '신호등', '기분', '한마디'],
  '온도계':    ['시각', '날짜', '변화', '이유', '누적'],
  '알림장':    ['날짜', '내용', '고친 시각'],
  '수업계획':   ['날짜', '교시', '과목', '단원 · 차시', '학습 목표', '수업 계획', '활동 계획', '준비물', '메모', '고친 시각'],
};
// 출석부처럼 학생 × 날짜로 그려지는 체크표 (앱이 기록을 보고 저절로 다시 그린다)
const CHECKS = [
  ['우유 체크', '우유', '#cfe3fb'], ['다했어요 체크', '다했어요', '#d3f2df'], ['1인1역 체크', '1인1역', '#fbeac2'],
  ['발표 체크', '발표', '#e3dcfb'], ['마음 체크', '마음', ''],
];
// 탭이 놓이는 순서와 색 묶음
const ORDER = ['읽어 주세요', '설정', '월별 보기', '출결', '우유 체크', '다했어요 체크', '1인1역 체크', '발표 체크', '마음 체크', '학생별', '날짜별',
  '학생', '계정', '기초시간표', '시간표변경', '일정', '명언', '할일', '알림장', '선생님노트', '수업계획', '쪽지', '자리배치', '모둠', '기록', '감정', '온도계'];
const GROUP = {
  '읽어 주세요': '#b8323f', '설정': '#7566c0', '월별 보기': '#d9822b', '우유 체크': '#35915a', '다했어요 체크': '#35915a', '1인1역 체크': '#35915a', '발표 체크': '#35915a', '마음 체크': '#35915a',
  '학생별': '#b3831f', '날짜별': '#b3831f', '출결': '#c9636d',
  '학생': '#2e77c8', '계정': '#2e77c8', '기초시간표': '#2e77c8', '시간표변경': '#2e77c8', '일정': '#2e77c8', '명언': '#2e77c8', '할일': '#2e77c8',
  '선생님노트': '#c9636d', '수업계획': '#c9636d', '알림장': '#2e77c8', '쪽지': '#c9636d', '자리배치': '#2b968f', '모둠': '#2b968f',
  '기록': '#9ca3af', '감정': '#9ca3af', '온도계': '#9ca3af',
};
const RAW = ['기록', '감정', '온도계'];   // 앱이 쓰는 원본 기록 — 평소엔 숨겨 두고 메뉴로 보이기
const KINDS = { '우유': '#dbeafe', '다했어요': '#dcfce7', '1인1역': '#fef3c7', '발표': '#ede9fe', '수업방해': '#fde2e4' };
const LIGHTS = { '초록': '#d1fae5', '노랑': '#fef3c7', '빨강': '#fee2e2' };
const WIDTHS = {
  '설정': [130, 320, 440], '학생': [60, 110, 160, 60, 80, 60], '계정': [60, 100],
  '기초시간표': [70, 120, 90, 90, 90, 90, 90], '시간표변경': [110, 80, 80, 80, 80, 80, 80, 80], '일정': [110, 220, 80],
  '명언': [460, 140], '할일': [60, 110, 320, 70], '기록': [140, 110, 80, 60, 90, 220], '온도계': [140, 110, 60, 200, 60],
  '쪽지': [60, 140, 110, 360], '감정': [140, 110, 60, 90, 70, 90, 260],
  '선생님노트': [140, 110, 60, 90, 80, 420], '알림장': [110, 520, 140], '수업계획': [110, 50, 70, 160, 220, 360, 360, 160, 200, 140], '모둠': [90, 60, 100, 110], '출결': [110, 60, 90, 70, 80, 60, 260, 140],
  '학생별': [60, 90, 70, 80, 80, 70, 80, 100, 90, 90], '날짜별': [110, 80, 100, 100, 80, 60, 60, 60, 90],
};
const ALIGN = {   // 칸마다 정렬 (polish_)
  '설정': 'lll', '학생': 'cclccc', '계정': 'cc', '기초시간표': 'ccccccc', '시간표변경': 'cccccccc', '일정': 'clc', '명언': 'll',
  '할일': 'cclc', '쪽지': 'cccl', '선생님노트': 'cccccl', '수업계획': 'ccclllllll', '알림장': 'clc', '모둠': 'cccc', '출결': 'cccccclc',
  '학생별': 'clcccccccc', '날짜별': 'ccccccccc', '기록': 'cccccl', '감정': 'ccccccl', '온도계': 'ccclc',
};
const SETTABLE = ['학급 닉네임', '학생 수', '이름 보이기', '지금 활동', '타이머 소리', '온도계 목표', '칭찬 이유', '온도계 보상', '온도계 수업방해 없는 날', '온도계 하루 정산 시각', '온도계 1인1역 기준', '온도계 1인1역 온도', '독서 · 명상 시간', '과목',
  '계정 확인', '계정 종류', '대표 색', '날씨 지역', '독서 음악 주소', '꺼 둔 기능', '화면 테마'];
// 나이스 출결 기호 (종류 × 구분)
const ATT = { '결석': { '질병': '♡', '미인정': '♥', '기타': '▲', '출석인정': '△' }, '지각': { '질병': '#', '미인정': 'X', '기타': '≠', '출석인정': '◁' },
  '조퇴': { '질병': '@', '미인정': '◎', '기타': '∽', '출석인정': '▷' }, '결과': { '질병': '☆', '미인정': '◇', '기타': '=', '출석인정': '▽' } };

// ── 가게 문 ─────────────────────────────────────────────
function doGet(e) {
  // ?page=guide : 가이드북 (Apps Script 안의 guide 파일)
  if (e && e.parameter && e.parameter.page === 'guide') {
    try { return HtmlService.createHtmlOutputFromFile('guide').setTitle('우리반 바탕화면 가이드북').addMetaTag('viewport', 'width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }
    catch (err) { return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:30px">가이드북 파일(guide)이 아직 없어요. Apps Script에서 [+] → HTML → 이름 guide 로 만들어 guide.html 내용을 붙여 넣어 주세요.</p>'); }
  }
  setup();
  const t = HtmlService.createTemplateFromFile('index');
  t.url = ScriptApp.getService().getUrl();
  return t.evaluate()
    .setTitle('우리반 바탕화면')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

const SAMPLE_NAMES = ['김하늘', '이도윤', '박서연', '최민준', '정하은', '강지호', '조수아', '윤서준', '장예린', '임건우', '한지민', '오시우', '서유나',
  '신동현', '권다인', '황준서', '안채원', '송민재', '류아린', '전우진', '홍서아', '고태윤', '문하린', '양지안', '배은호'];
const SAMPLE_SEX = ['여', '남', '여', '남', '여', '남', '여', '남', '여', '남', '여', '남', '여', '남', '여', '남', '여', '남', '여', '남', '여', '남', '여', '여', '남'];
const SAMPLE_ROLES = ['칠판 정리', '우유 당번', '급식 도우미', '화분 물 주기', '불 끄기', '창문 열고 닫기', '분리수거', '책꽂이 정리', '신발장 정리',
  '사물함 점검', '학급문고 정리', '컴퓨터 끄기', '지우개 털기', '알림장 확인', '출석 도우미', '보건 도우미', '체육 도구 정리', '미술 도구 정리',
  '우산꽂이 정리', '바닥 점검', '게시판 정리', '손소독제 채우기', '휴지 채우기', '학습지 나눔이', '시간표 확인'];
const HINT_ASK = '비밀번호 힌트를 선생님께 알려 주세요.';   // 계정 탭 힌트 칸의 기본 글 — 학생이 알려 주면 선생님이 하나씩 바꿔 적는다
const SAMPLE_HINTS = ['꿈(영어, 첫 글자 대문자) + 숫자 4자리 + !', '처음 비밀번호 카드 그대로 (선생님께 받은 것)', '좋아하는 낱말 영어 + 숫자 + 느낌표'];
const SAMPLE_TT = [['1교시', '09:00-09:40', '국어', '수학', '국어', '과학', '사회'], ['2교시', '09:50-10:30', '수학', '국어', '도덕', '과학', '국어'],
  ['3교시', '10:40-11:20', '사회', '과학', '수학', '국어', '수학'], ['4교시', '11:30-12:10', '체육', '영어', '체육', '수학', '음악'],
  ['5교시', '13:00-13:40', '음악', '미술', '실과', '영어', '체육'], ['6교시', '13:50-14:30', '창체', '미술', '', '사회', '창체'], ['7교시', '', '', '', '', '', '']];

function samples_(today) {
  const pad = function (n) { return ('0' + n).slice(-2); };
  return {
    '설정': [
      ['학급 닉네임', '꿈을 키우는 6학년 2반', '화면 맨 위에 크게 나옵니다'],
      ['선생님 비밀번호', '1234', '선생님 서랍(노트 · 마음 · 출결 · 시간표 · 화면 꾸미기)을 열 때. 꼭 바꾸세요. 잊으면 [선생님] → [비밀번호를 잊었어요]로 내 구글 메일로 받아요'],
      ['학생 수', '25', '번호 버튼 개수 (1~40). 이름 · 1인 1역 · 생일은 학생 탭에서'],
      ['이름 보이기', '번호와 이름', '번호와 이름 / 번호만 / 이름만'],
      ['지금 활동', '수학 익힘책 24~25쪽', "'다 했어요' 판에 보이는 활동 이름 (웹 앱 선생님 모드에서 바로 고쳐도 돼요)"],
      ['타이머 소리', '예', '타이머 · 축하 소리 (예/아니오)'],
      ['온도계 목표', '100', '학급 온도계가 이 온도가 되면 축하'],
      ['칭찬 이유', '바른 인사,협동,정리정돈,발표,배려,집중', '온도계 올릴 때 고르는 이유 (쉼표로)'],
      ['온도계 보상', '25:간식 보상,50:자유 체육 시간,75:자유 디벗 데이,100:영화 간식 파티', '온도별 보상 (온도:보상 이름, 쉼표로). 선생님 서랍 > 온도계에서 고쳐요'],
      ['온도계 수업방해 없는 날', '5', "번호판 '수업방해'에 아무도 선택되지 않은 날 오르는 온도 (0이면 끔)"],
      ['온도계 하루 정산 시각', '14:30', '매일 이 시각에 그날 수업방해 없는 날을 온도계에 반영'],
      ['온도계 1인1역 기준', '80', '한 주(월~금) 1인 1역 다 한 비율이 이 % 이상이면'],
      ['온도계 1인1역 온도', '5', '그 주가 끝나면 오르는 온도 (0이면 끔)'],
      ['과목', '국어,도덕,수학,사회,과학,음악,미술,실과,체육,영어,창체', '시간표 스티커 (쉼표로)'],
      ['독서 · 명상 시간', '20', '독서 · 명상 모드 (분)'],
      ['독서 음악 주소', '', '내 음악 파일(mp3) 주소. 비워 두면 앱에 들어 있는 클래식 · 명상 음악'],
      ['계정 확인', '예', "번호판 '내 계정' 쓰기 (예/아니오)"],
      ['계정 종류', '아이톡톡', "쉼표로 (예: 구글,아이톡톡,e학습터). 바꾸면 '계정' 탭에 아이디 · 비밀번호 · 힌트 칸이 저절로 생겨요. 빼려면 그 칸을 먼저 비워요"],
      ['화면 잠금 코드', '', "비워 두면 없음. 숫자로 정하면 바탕화면을 열 때 이 코드를 물어봐요"],
      ['날씨 지역', '창원시 마산합포구', '지역 이름. 선생님 모드에서 바꾸면 위치를 저절로 찾아요'],
      ['위도', '35.20', '날씨 · 미세먼지 위치 (지역 이름을 바꾸면 저절로)'],
      ['경도', '128.57', '날씨 · 미세먼지 위치 (지역 이름을 바꾸면 저절로)'],
      ['급식 학교', '', "'오늘 급식' 카드에 나올 학교. 선생님 서랍 > 설정 > 우리 학교 급식에서 찾아 고르면 저절로 채워져요"],
      ['급식 학교 코드', '', '나이스 학교 코드 (교육청|학교). 학교를 고르면 저절로 — 직접 고치지 마세요'],
      ['대표 색', '#7566c0', '버튼 · 시트 머리글 색 (#으로 시작)'],
      ['설치한 날', today, "이 날 전의 기록은 예시예요. 선생님 서랍 > 시트 관리 > '예시 데이터만 지우기'가 이 날짜로 골라 지워요"],
      ['화면 테마', '밝은 파스텔', '밝은 파스텔 / 별밤 네온'],
      ['꺼 둔 기능', '', '쓰지 않을 기능 이름을 쉼표로 (예: 우유 다 먹었어요,내 계정). 선생님 서랍 > 기능 켜고 끄기에서 눌러서 바꿔도 돼요'],
      ['배치', '', '화면 꾸미기에서 저장한 카드 배치. 직접 고치지 마세요'],
      ['자리 저장', '', '자리 뽑기에서 저장한 배치. 직접 고치지 마세요'],
    ],
    '학생': SAMPLE_NAMES.map(function (n, i) { return [i + 1, n, SAMPLE_ROLES[i], '예', i ? pad(i % 12 + 1) + '-' + pad(i * 7 % 28 + 1) : today.slice(5), SAMPLE_SEX[i] || '']; }),
    '계정': SAMPLE_NAMES.map(function (n, i) { return [i + 1, n, 'student' + (i + 1) + '@gne.go.kr', 'Dream' + (1000 + i * 373 % 9000) + '!', HINT_ASK]; }),
    '기초시간표': SAMPLE_TT,
    '시간표변경': [],
    '일정': [[addDays_(today, 3), '도서관 견학', '행사'], [addDays_(today, 6), '현장체험학습', '행사'], [addDays_(today, 13), '수학 단원평가', '시험'],
      [addDays_(today, 20), '학예회', '행사'], [addDays_(today, 70), '겨울방학', '휴일']],
    '명언': [
      ['천 리 길도 한 걸음부터', '속담'], ['티끌 모아 태산', '속담'], ['오늘도 친구에게 먼저 인사해요', '우리반 다짐'],
      ['실수는 배움의 시작이에요', '우리반 다짐'], ['가는 말이 고와야 오는 말이 곱다', '속담'], ['백지장도 맞들면 낫다', '속담'],
      ['나는 어제의 나보다 조금 더 자랐어요', '우리반 다짐'], ['구슬이 서 말이라도 꿰어야 보배', '속담'], ['고운 말 한마디가 교실을 밝혀요', '우리반 다짐'],
      ['낙숫물이 댓돌을 뚫는다', '속담'], ['모르는 것은 물어보는 용기가 멋져요', '우리반 다짐'],
      ['콩 심은 데 콩 나고 팥 심은 데 팥 난다', '속담'], ['오늘 할 일을 내일로 미루지 말자', '우리반 다짐'], ['세 살 버릇 여든까지 간다', '속담'],
      ['친구의 좋은 점을 하나 찾아 말해 줘요', '우리반 다짐'], ['돌다리도 두들겨 보고 건너라', '속담'], ['우리는 서로에게 좋은 선생님이에요', '우리반 다짐'],
      ['말 한마디로 천 냥 빚을 갚는다', '속담'], ['끝까지 해 보는 사람이 멋진 사람', '우리반 다짐'], ['아는 길도 물어 가라', '속담'],
    ],
    '할일': [[1, today, '가정통신문 회수 (현장체험학습)', '아니오'], [2, today, '3교시 과학 실험 준비물 확인', '아니오'], [3, today, '수학 익힘책 검사', '아니오']],
    '쪽지': [[1, today + ' 08:40', '7번', '보건실 다녀올게요'], [2, today + ' 08:52', '반장', '체육복 안 가져온 친구 2명이에요'], [3, today + ' 08:57', '12번', '선생님 어제 이야기책 너무 재미있었어요!']],
    '선생님노트': [[today + ' 08:30', today, 3, SAMPLE_NAMES[2], '칭찬', '친구 준비물을 먼저 챙겨 줌'], [today + ' 08:35', today, 9, SAMPLE_NAMES[8], '관찰', '아침에 기운이 없어 보임 — 쉬는 시간에 이야기 나누기']],
    '모둠': [], '학생별': [], '날짜별': [], '기록': [], '감정': [], '온도계': [],
  };
}

// ── 처음 한 번: 탭 · 머리글 · 예시 · 서식. 옛 시트에는 빠진 탭 · 항목만 더한다 ──────
// 탭 만들기는 한 번에 한 곳에서만 (웹 앱 창과 '처음 상태로 다시 만들기'가 동시에 같은 탭을 만들지 않게)
function setup() {
  if (CacheService.getScriptCache().get('setup-v7')) return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try { setup_(); } finally { lock.releaseLock(); }
}
function setup_() {
  const cache = CacheService.getScriptCache();
  if (cache.get('setup-v7')) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const have = {};
  ss.getSheets().forEach(function (sh) { have[sh.getName()] = true; });
  const samples = samples_(today_());
  let made = false;
  ORDER.forEach(function (name) {
    if (have[name] || ss.getSheetByName(name)) return;
    made = true;
    const sh = ss.insertSheet(name);
    if (name === '읽어 주세요') { readme_(sh); return; }
    if (!TABS[name]) { styleTab_(sh, name); if (name === '자리배치') sh.getRange(1, 1).setValue('자리 뽑기에서 [시트에 저장]을 누르면 여기에 교실 모양 그대로 그려져요.'); return; }
    sh.appendRow(head_(name));
    if (name === '설정') { sh.getRange(2, 2, 300, 1).setNumberFormat('@'); _set = null; }
    if (name === '학생') sh.getRange(2, 5, 300, 1).setNumberFormat('@');
    if (name === '기초시간표') sh.getRange(2, 2, 20, 6).setNumberFormat('@');
    if (name === '시간표변경') sh.getRange(2, 2, 300, 7).setNumberFormat('@');
    const rows = samples[name] || [];
    if (rows.length) sh.getRange(2, 1, rows.length, head_(name).length).setValues(rows.map(function (x) { return x.slice(0, head_(name).length); }));
    decorate_(sh, name);
  });
  if (!have['기록']) seedDemo_();
  migrate_();   // 옛 이름 바꾸기가 먼저 (그래야 빠진 항목을 더할 때 겹치지 않는다)
  if (have['설정']) addMissing_('설정', samples['설정']);
  if (have['설정']) syncNotes_(samples['설정']);
  if (have['읽어 주세요'] && readmeOld_()) readme_(sheet_('읽어 주세요'));
  syncTabs_();
  const left = ss.getSheetByName('잠깐');
  if (left && ss.getSheets().length > 1) { try { if (ss.getActiveSheet().getName() === '잠깐') ss.setActiveSheet(sheet_('설정')); ss.deleteSheet(left); } catch (e) {} }
  if (made) {
    _set = null;
    orderTabs_();
    RAW.forEach(function (n) { const sh = sheet_(n); if (sh) sh.hideSheet(); });
    updateSummary();
    const first = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1');
    if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  }
  cache.put('setup-v7', '1', 600);
}

// 설정 탭 '설명' 칸은 앱이 쓰는 안내 글 — 코드가 바뀌면 옛 설명(예: 편지함)을 새 설명으로 맞춘다. 선생님이 적는 '값' 칸은 건드리지 않는다
function syncNotes_(rows) {
  const sh = sheet_('설정'), v = sh.getDataRange().getValues(), want = {};
  rows.forEach(function (r) { want[r[0]] = r[2]; });
  for (let i = 1; i < v.length; i++) { const k = String(v[i][0]).trim(); if (want[k] != null && String(v[i][2]) !== want[k]) sh.getRange(i + 1, 3, 1, 1).setValues([[want[k]]]); }
}
function addMissing_(name, rows) {
  const sh = sheet_(name), keys = {};
  sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).getValues().forEach(function (r) { keys[String(r[0]).trim()] = true; });
  const add = rows.filter(function (r) { return !keys[r[0]]; }).map(function (r) { return r; });
  if (add.length) { sh.getRange(sh.getLastRow() + 1, 1, add.length, rows[0].length).setValues(add); _set = null; }
}

// v1 시트를 v2 모양으로: 기초시간표(요일 × 교시 → 교시 × 요일), 학생 탭 '생일' 열
function migrate_() {
  const tt = sheet_('기초시간표');
  if (tt && String(tt.getRange(1, 1, 1, 1).getValues()[0][0]) === '요일') {
    const v = tt.getDataRange().getValues(), base = {};
    v.slice(1).forEach(function (r) { base[r[0]] = r.slice(1, 8); });
    const times = String(settings_()['교시 시각'] || '').split(',').map(function (x) { return x.trim(); });
    const rows = [0, 1, 2, 3, 4, 5, 6].map(function (i) {
      return [(i + 1) + '교시', times[i] || ''].concat(['월', '화', '수', '목', '금'].map(function (d) { return String((base[d] || [])[i] || ''); }));
    });
    tt.clear();
    tt.appendRow(TABS['기초시간표']);
    tt.getRange(2, 2, 20, 6).setNumberFormat('@');
    tt.getRange(2, 1, 7, 7).setValues(rows);
    decorate_(tt, '기초시간표');
  }
  // '아침 독서 시간' → '독서 · 명상 시간' (선생님이 적어 둔 분은 그대로)
  const set = sheet_('설정');
  if (set) { const sv = set.getDataRange().getValues(); for (let i = 1; i < sv.length; i++) if (String(sv[i][0]).trim() === '아침 독서 시간') { set.getRange(i + 1, 1, 1, 3).setValues([['독서 · 명상 시간', sv[i][1], '독서 · 명상 모드 (분)']]); _set = null; } }
  // '온도계 이름 없는 날' → '온도계 수업방해 없는 날' (값은 그대로)
  if (set) { const sv = set.getDataRange().getValues(); if (!sv.some(function (r) { return String(r[0]).trim() === '온도계 수업방해 없는 날'; })) for (let i = 1; i < sv.length; i++) if (String(sv[i][0]).trim() === '온도계 이름 없는 날') { set.getRange(i + 1, 1, 1, 1).setValues([['온도계 수업방해 없는 날']]); _set = null; } }
  // v3: 편지함을 없앴다 → 설정 탭의 편지함 줄도 치운다 (편지함 탭은 선생님 기록이라 그대로 둔다)
  if (set) { const sv = set.getDataRange().getValues(); for (let i = sv.length - 1; i >= 1; i--) if (/^편지함 (주소|QR 바꾸기)$/.test(String(sv[i][0]).trim())) { set.deleteRow(i + 1); _set = null; } }
  const st = sheet_('학생');
  if (st) {
    const head = st.getRange(1, 1, 1, Math.max(4, st.getLastColumn())).getValues()[0];
    if (head.indexOf('생일') < 0) { st.getRange(1, 5, 1, 1).setValues([['생일']]); decorate_(st, '학생'); }
    const h2 = st.getRange(1, 1, 1, Math.max(5, st.getLastColumn())).getValues()[0];
    if (h2.indexOf('성별') < 0) { st.getRange(1, 6, 1, 1).setValues([['성별']]); decorate_(st, '학생'); }
  }
}

// 지난 날들의 예시 기록 — 처음 열었을 때 체크표 · 학생별 · 날짜별 표와 그래프가 비어 보이지 않게
function seedDemo_() {
  const today = today_(), rows = [], th = [], fe = [];
  const st = rows_('학생');
  let total = 0;
  const reasons = ['바른 인사', '협동', '정리정돈', '발표', '배려', '집중'], moods = ['기뻐요', '신나요', '편안해요', '그저 그래요', '피곤해요', '속상해요'];
  for (let i = 12; i >= 1; i--) {
    const d = addDays_(today, -i), wd = new Date(d + 'T12:00:00').getDay();
    if (wd === 0 || wd === 6) continue;
    st.forEach(function (s, j) {
      const no = Number(s['번호']);
      if ((i + j) % 6) rows.push([d + ' 10:2' + (j % 10), d, '우유', no, s['이름'], '']);
      if ((i * 3 + j) % 4) rows.push([d + ' 15:0' + (j % 10), d, '1인1역', no, s['이름'], s['1인 1역']]);
      if ((i + j * 7) % 5 === 0) rows.push([d + ' 11:1' + (j % 10), d, '발표', no, s['이름'], '']);
      if ((i + j) % 3 === 0) rows.push([d + ' 14:3' + (j % 10), d, '다했어요', no, s['이름'], '수학 익힘책']);
      if ((i + j) % 2 === 0) {
        const k = (i * 5 + j * 3) % 10, light = k < 6 ? '초록' : k < 9 ? '노랑' : '빨강';
        fe.push([d + ' 08:4' + (j % 10), d, no, s['이름'], light, light === '초록' ? moods[k % 3] : light === '노랑' ? moods[3 + (k % 2)] : moods[5], '']);
      }
    });
    [0, 1, 2].forEach(function (k) {
      const delta = k === 2 && i % 3 === 0 ? -1 : (k + i) % 2 ? 3 : 2;
      total += delta;
      th.push([d + ' 1' + (k + 1) + ':00', d, delta, delta < 0 ? '복도에서 뛰었어요' : reasons[(i + k) % reasons.length], total]);
    });
  }
  if (rows.length) sheet_('기록').getRange(2, 1, rows.length, 6).setValues(rows);
  if (th.length) sheet_('온도계').getRange(2, 1, th.length, 5).setValues(th);
  if (fe.length) sheet_('감정').getRange(2, 1, fe.length, 7).setValues(fe);
}

// ── '읽어 주세요' 탭: 보안 약속 · 개인정보 · 심의 근거 · 도움 (맨 앞 탭) ─────────────
const README_VER = 'readme-v5';
const LEGAL = {
  privacy: 'https://kimman.kr/desk/privacy', terms: 'https://kimman.kr/desk/terms',
  checklist: 'https://kimman.kr/desk/docs/checklist.pdf', committee: 'https://kimman.kr/desk/docs/committee.pdf',
  guide: 'https://kimman.kr/files/desk-guidebook.pdf', video: 'https://youtu.be/iLkx44GilMA', edzip: 'https://edzip.kr/learning-sw/6ad6b0f5d10f07cea12da7c9',
  mail: 'rlaalscjswo1@gmail.com',
};
function readmeOld_() { const sh = sheet_('읽어 주세요'); return !sh || String(sh.getRange('H1').getValue()) !== README_VER; }
function readmeAgain() { readme_(sheet_('읽어 주세요') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('읽어 주세요', 0)); orderTabs_(); SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet_('읽어 주세요')); }
function readme_(sh) {
  const link = function (url, label) { return '=HYPERLINK("' + url + '","' + label + '")'; };
  const rows = [
    ['T', '우리반 바탕화면 — 먼저 읽어 주세요', ''],
    ['S', '이 시트에는 학생 이름 · 출결 사유 · 마음 기록 · 계정 비밀번호가 들어 있어요. 선생님 혼자만 보는 곳이에요.', ''],
    ['H', '1. 보안 약속 (꼭 지켜 주세요)', ''],
    ['W', '이 시트를 학생 · 학부모 · 다른 사람에게 절대 공유하지 마세요.', "오른쪽 위 [공유] → '일반 액세스'가 '제한됨'인지, 사람 목록에 선생님만 있는지 확인"],
    ['B', '학생들은 칠판 화면에서 자기 아이디와 비밀번호 힌트만 30초 동안 봐요.', "'계정' 탭의 빨간 비밀번호 칸은 화면에 절대 나오지 않아요"],
    ['B', "힌트 칸에는 처음에 '" + HINT_ASK + "'가 들어 있어요.", '학생이 힌트를 알려 주면 선생님이 하나씩 바꿔 적어요. 비밀번호 자체는 힌트에 적지 마세요'],
    ['B', '선생님 비밀번호(설정 탭)는 처음 1234에서 꼭 바꾸세요.', '서랍 > 설정 > 선생님 비밀번호 바꾸기. 잊으면 [선생님] → [비밀번호를 잊었어요] → 내 구글 메일로 받기'],
    ['B', '교실을 비울 때는 머리띠 [잠금], 하루가 끝나면 구글 로그아웃.', '잠금은 선생님 비밀번호로만 풀려요'],
    ['B', '웹 앱 주소 · 시트 주소를 학생에게 알려 주지 마세요.', '학생은 교실 칠판 화면에서만 써요. 학생 기기 접속 기능은 없어요'],
    ['H', '2. 개인정보 · 학운위 · 에듀집 근거', ''],
    ['L', link(LEGAL.privacy, '개인정보처리방침 (교육부 필수기준 9개 항목 = 제1~11조)'), '학생 정보는 이 시트(선생님 구글 드라이브)에만 저장 · 제작자 서버에 모으지 않음'],
    ['L', link(LEGAL.terms, '이용약관'), '무료 · 광고 없음 · 회원가입 없음'],
    ['L', link(LEGAL.checklist, '필수기준 체크리스트 (교육부 [서식 2] · 9개 항목 모두 충족)'), '에듀집 제출본과 같은 파일'],
    ['L', link(LEGAL.committee, '학운위 심의자료(안) — 학교 담당자에게 드리기'), '절차: 교원 의견수렴 → 기준 확인 → 학운위 심의 → 학교장 확정'],
    ['L', link(LEGAL.edzip, '에듀집 필수기준 점검결과 — 확인완료 (2026. 10. 20.)'), '교육부 · 한국교육학술정보원 에듀집에 등록된 점검 결과'],
    ['B', '제작자는 학운위원이더라도 이 소프트웨어 심의에 참여할 수 없어요 (교육부 가이드라인).', ''],
    ['H', '3. 도움', ''],
    ['L', link(LEGAL.video, '사용법 영상 (유튜브)'), ''],
    ['L', link(LEGAL.guide, '그림으로 보는 가이드북 (PDF)'), ''],
    ['B', '문의 · 열람 · 삭제 요청: ' + LEGAL.mail, '선생님 서랍 > 제작자에게 로도 보낼 수 있어요'],
  ];
  sh.clear();
  try { sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart(); } catch (e) {}
  if (sh.getMaxColumns() < 8) sh.insertColumnsAfter(sh.getMaxColumns(), 8 - sh.getMaxColumns());
  sh.setHiddenGridlines(true); sh.setTabColor(GROUP['읽어 주세요']);
  sh.setColumnWidth(1, 24); sh.setColumnWidth(2, 520); sh.setColumnWidth(3, 470);
  const all = sh.getRange(1, 1, rows.length + 1, 3);
  all.setFontFamily('Noto Sans KR').setFontSize(11).setVerticalAlignment('middle').setFontColor('#2d2b3d').setWrap(true);
  rows.forEach(function (r, i) {
    const row = i + 1, b = sh.getRange(row, 2), c = sh.getRange(row, 3);
    if (r[1].charAt(0) === '=') b.setFormula(r[1]); else b.setValue(r[1]);
    c.setValue(r[2]); c.setFontColor('#6b6880').setFontSize(10);
    sh.setRowHeight(row, r[0] === 'T' ? 48 : r[0] === 'H' ? 40 : 32);
    if (r[0] === 'T') { sh.getRange(row, 2, 1, 2).merge(); b.setFontSize(18).setFontWeight('bold').setFontColor('#46336e'); }
    if (r[0] === 'S') { sh.getRange(row, 2, 1, 2).merge(); b.setFontWeight('bold').setFontColor('#9f1d2c'); sh.getRange(row, 1, 1, 3).setBackground('#fde8ea'); }
    if (r[0] === 'H') { b.setFontSize(13).setFontWeight('bold').setFontColor('#46336e'); sh.getRange(row, 1, 1, 3).setBackground('#efeafb'); }
    if (r[0] === 'W') { b.setFontWeight('bold').setFontColor('#9f1d2c'); sh.getRange(row, 1, 1, 3).setBackground('#fff4d6'); sh.getRange(row, 1).setValue('!').setFontWeight('bold').setFontColor('#b8323f').setHorizontalAlignment('center'); }
    if (r[0] === 'B' || r[0] === 'L') sh.getRange(row, 1).setValue('·').setHorizontalAlignment('center').setFontColor('#9a95b5');
    if (r[0] === 'L') b.setFontWeight('bold').setFontColor('#2e5fb8');
  });
  sh.getRange('H1').setValue(README_VER).setFontColor('#ffffff');
  sh.setFrozenRows(2);
  guard2_(sh, "'읽어 주세요' 안내");
}

// ── 시트 꾸미기: 탭 색 · 머리글 · 열 너비 · 줄무늬 · 글꼴 · 조건부 색 ─────────────
function styleTab_(sh, name) {
  sh.setTabColor(GROUP[name] || '#60a5fa');
  sh.getRange(1, 1, sh.getMaxRows(), Math.min(sh.getMaxColumns(), 30)).setFontFamily('Noto Sans KR').setFontSize(10).setVerticalAlignment('middle');
}
function decorate_(sh, name) {
  const n = head_(name).length, color = GROUP[name] || mainColor_();
  if (sh.getMaxColumns() > n && name !== '학생별' && name !== '날짜별') sh.deleteColumns(n + 1, sh.getMaxColumns() - n);
  styleTab_(sh, name);
  sh.getRange(1, 1, 1, n).setFontWeight('bold').setFontColor('#ffffff').setBackground(color).setHorizontalAlignment('center');
  sh.setFrozenRows(1);
  WIDTHS[name].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  if (name === '계정' && n > 2) for (let c = 3; c <= n; c++) sh.setColumnWidth(c, [210, 150, 260][(c - 3) % 3]);
  polish_(sh, name, n, color, name !== '선생님노트');   // 노트는 줄바꿈해서 다 보이게 (줄 높이 자동)
  const center = function (a1) { sh.getRange(a1).setHorizontalAlignment('center'); };
  const yesNo = SpreadsheetApp.newDataValidation().requireValueInList(['예', '아니오'], true).build();
  const list = function (a1, items) { dv_(sh, a1, SpreadsheetApp.newDataValidation().requireValueInList(items, true).setAllowInvalid(true).build()); };
  const colors = function (a1, map) {
    sh.setConditionalFormatRules(Object.keys(map).map(function (k) {
      return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(k).setBackground(map[k]).setRanges([sh.getRange(a1)]).build();
    }));
  };
  if (name === '설정') { sh.getRange('A2:A').setFontWeight('bold').setFontColor('#46336e'); sh.getRange('C2:C').setFontColor('#8a87a0').setFontSize(9);
    sh.getRange(2, 2, Math.max(2, sh.getLastRow()) - 1, 1).setBackground(tint_(color, .9)).setFontWeight('bold'); }   // 값 칸 = 선생님이 적는 곳
  if (name === '학생') { center('A2:A'); center('D2:F'); sh.getRange('A2:A').setFontWeight('bold'); dv_(sh, 'D2:D', yesNo); try { dv_(sh, 'F2:F', SpreadsheetApp.newDataValidation().requireValueInList(['남', '여'], true).setAllowInvalid(true).build()); } catch (e) {} }
  if (name === '계정') { center('A2:B'); sh.getRange('A2:B').setFontWeight('bold');
    for (let c = 3; c <= n; c++) {
      const k = (c - 3) % 3;   // 0 아이디 · 1 비밀번호(선생님만) · 2 힌트(학생 화면에 보임)
      if (k < 2) sh.getRange(2, c, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono');
      sh.getRange(1, c).setBackground(k === 1 ? '#b8323f' : Math.floor((c - 3) / 3) % 2 ? '#5a7390' : '#2e77c8');
      if (k === 1) sh.getRange(2, c, sh.getMaxRows() - 1, 1).setFontColor('#9f1d2c');
    }
    sh.getRange(1, 1, 1, n).setWrap(true); sh.setRowHeight(1, 46); }
  if (name === '기초시간표') {
    sh.getRange('A2:G').setHorizontalAlignment('center'); sh.getRange('A2:A').setFontWeight('bold').setFontColor('#1f4f86'); sh.getRange('B2:B').setFontColor('#77748c');
    sh.setRowHeights(2, 7, 34); sh.getRange('C2:G').setFontWeight('bold');
  }
  if (name === '시간표변경') { sh.getRange('A2:H').setHorizontalAlignment('center'); sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd'); }
  if (name === '일정') { center('A2:A'); center('C2:C'); sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd'); list('C2:C', ['행사', '시험', '휴일', '기타']);
    colors('C2:C', { '행사': '#dbeafe', '시험': '#fee2e2', '휴일': '#dcfce7', '기타': '#f3f4f6' }); }
  if (name === '할일') { center('A2:B'); center('D2:D'); sh.getRange('B2:B').setNumberFormat('yyyy-mm-dd'); dv_(sh, 'D2:D', yesNo); }
  if (name === '쪽지') { center('A2:C'); sh.getRange('B2:B').setNumberFormat('yyyy-mm-dd hh:mm'); }
  if (name === '선생님노트') { center('B2:E'); sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm'); sh.getRange('B2:B').setNumberFormat('yyyy-mm-dd'); sh.getRange('F2:F').setWrap(true);
    list('E2:E', ['칭찬', '관찰', '상담', '생활', '학습']); colors('E2:E', { '칭찬': '#dcfce7', '관찰': '#e0e7ff', '상담': '#fee2e2', '생활': '#fef3c7', '학습': '#dbeafe' }); }
  if (name === '기록' || name === '온도계' || name === '감정') { sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm'); sh.getRange('B2:B').setNumberFormat('yyyy-mm-dd'); }
  if (name === '기록') { center('C2:E'); list('C2:C', Object.keys(KINDS)); colors('C2:C', KINDS); }
  if (name === '온도계') { center('C2:C'); center('E2:E'); sh.getRange('C2:C').setNumberFormat('+0;-0;0'); }
  if (name === '감정') { center('C2:F'); list('E2:E', Object.keys(LIGHTS)); colors('E2:E', LIGHTS); }
  if (name === '모둠') { center('A2:D'); }
  if (name === '출결') { center('A2:F'); sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd'); sh.getRange('F2:F').setNumberFormat('@'); sh.getRange('H2:H').setNumberFormat('yyyy-mm-dd hh:mm');
    list('D2:D', Object.keys(ATT)); list('E2:E', ['질병', '미인정', '기타', '출석인정']);
    colors('D2:D', { '결석': '#fee2e2', '지각': '#fef3c7', '조퇴': '#e0e7ff', '결과': '#dcfce7' }); }
  if (name === '학생별') {
    center('A2:A'); center('C2:J');
    sh.getRange('A2:B').setFontWeight('bold');
    sh.setConditionalFormatRules(['C2:C', 'D2:D', 'E2:E', 'F2:F', 'G2:G'].map(function (a1, i) {
      return SpreadsheetApp.newConditionalFormatRule().setGradientMinpoint('#ffffff').setGradientMaxpoint(['#93c5fd', '#86efac', '#fcd34d', '#c4b5fd', '#a78bfa'][i])
        .setRanges([sh.getRange(a1)]).build();
    }).concat([SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#fee2e2').setFontColor('#b91c1c').setRanges([sh.getRange('I2:I')]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('빨강').setBackground('#fee2e2').setRanges([sh.getRange('H2:H')]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('노랑').setBackground('#fef3c7').setRanges([sh.getRange('H2:H')]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('초록').setBackground('#d1fae5').setRanges([sh.getRange('H2:H')]).build()]));
    sh.getRange(1, 1, 1, n).setWrap(true);
  }
  if (name === '날짜별') { center('B2:I'); sh.getRange('A2:A').setNumberFormat('@'); }
  if (name === '학생별' || name === '날짜별') guard2_(sh, name);
}
// ── 고급 정돈: 눈금선 숨김 · 넉넉한 줄 높이 · 한 가지 색 줄무늬 · 칸마다 정렬 · 긴 글은 칸 끝에서 자르기 ──
// ALIGN 의 글자 하나가 칸 하나: l 왼쪽 · c 가운데 · r 오른쪽. 꾸미기를 다시 하면 줄무늬도 새 색으로 바꿔 단다
function polish_(sh, name, n, color, fixedRows) {
  const rows = sh.getMaxRows();
  sh.setHiddenGridlines(true);
  sh.setRowHeight(1, 38);
  if (rows > 1 && fixedRows !== false) sh.setRowHeights(2, rows - 1, 30);
  if (rows < 2) return;
  sh.getBandings().forEach(function (b) { b.remove(); });
  sh.getRange(2, 1, rows - 1, n).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)
    .setFirstRowColor('#ffffff').setSecondRowColor(tint_(color, .94));
  sh.getRange(2, 1, rows - 1, n).setFontColor('#2d2b3d').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  String(ALIGN[name] || '').split('').forEach(function (a, i) {
    if (i < n) sh.getRange(2, i + 1, rows - 1, 1).setHorizontalAlignment({ l: 'left', c: 'center', r: 'right' }[a] || 'left');
  });
}
// ── 고르기 목록(▼)은 지금 쓰는 줄 + 빈 줄 하나까지만 (새 줄은 앱이 정해진 값으로 적는다) — 빈 줄 1000개에 ▼가 늘어서지 않게 (먼저 열 전체를 지운다) ──
function dv_(sh, a1, rule) {
  const m = /^([A-Z]+)(\d+):([A-Z]+)$/.exec(a1);
  if (!m) { sh.getRange(a1).setDataValidation(rule); return; }
  sh.getRange(a1).setDataValidation(null);
  sh.getRange(m[1] + m[2] + ':' + m[3] + Math.max(2, sh.getLastRow() + 1)).setDataValidation(rule);
}
// ── 앱이 그리는 표: 눈금선 숨김 · 옅은 칸 선 · 줄 높이 · 표 오른쪽 빈 칸 치우기 ──
function tidyTable_(sh, W, H, rowH) {
  sh.setHiddenGridlines(true);
  if (sh.getMaxColumns() > W + 1) sh.deleteColumns(W + 2, sh.getMaxColumns() - W - 1);
  sh.getRange(1, 1, H, W).setBorder(true, true, true, true, true, true, '#e4e0ef', SpreadsheetApp.BorderStyle.SOLID);
  if (H > 1 && rowH) sh.setRowHeights(2, H - 1, rowH);
}
// 탭을 정해 둔 순서 · 색으로 (새로 생긴 탭이 맨 뒤에 붙지 않게)
function orderTabs_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let i = 0;
  ORDER.forEach(function (name) { const sh = sheet_(name); if (!sh) return; i++; ss.setActiveSheet(sh); ss.moveActiveSheet(i); sh.setTabColor(GROUP[name]); });
  ss.setActiveSheet(sheet_('설정'));
}
// 색을 흰색 쪽으로 옅게 (줄무늬 · 칸 배경용)
function tint_(hex, t) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { return Math.round(v + (255 - v) * t); });
  return '#' + c.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
}

// ── 정리: 체크표(학생 × 날짜) · 학생별 · 날짜별 + 그래프. 저장이 끝난 뒤 sync · 메뉴에서 ─────────────
function tally_(month) {
  const n = studentCount_(), names = studentMap_(), by = {};
  for (let i = 1; i <= n; i++) by[i] = { no: i, name: names[i] ? names[i].name : '', milk: 0, done: 0, role: 0, talk: 0, talkAll: 0, last: '', g: 0, y: 0, r: 0, notes: 0 };
  rows_('기록').forEach(function (r) {
    const o = by[Number(r['번호'])], k = r['종류']; if (!o) return;
    if (k === '발표') o.talkAll++;
    if (String(r['날짜']).slice(0, 7) !== month) return;
    if (k === '우유') o.milk++; if (k === '다했어요') o.done++; if (k === '1인1역') o.role++; if (k === '발표') o.talk++;
  });
  rows_('감정').forEach(function (r) {
    const o = by[Number(r['번호'])]; if (!o) return;
    o.last = r['신호등'];
    if (String(r['날짜']).slice(0, 7) !== month) return;
    if (r['신호등'] === '초록') o.g++; if (r['신호등'] === '노랑') o.y++; if (r['신호등'] === '빨강') o.r++;
  });
  rows_('선생님노트').forEach(function (r) { const o = by[Number(r['번호'])]; if (o && String(r['날짜']).slice(0, 7) === month) o.notes++; });
  return Object.keys(by).map(function (k) { return by[k]; });
}
function updateSummary(force) {
  const month = today_().slice(0, 7);
  writeTable_('학생별', tally_(month).map(function (o) { return [o.no, o.name, o.milk, o.done, o.role, o.talk, o.talkAll, o.last, o.r, o.notes]; }), force);
  const days = {};
  const day = function (d) { return days[d] = days[d] || [d, {}, {}, {}, 0, 0, 0, 0, '']; };
  rows_('기록').forEach(function (r) { const d = r['날짜'], k = r['종류'], no = Number(r['번호']); if (!d) return; const dd = day(d);
    if (k === '우유') dd[1][no] = 1; if (k === '다했어요') dd[2][no] = 1; if (k === '1인1역') dd[3][no] = 1; if (k === '발표') dd[4]++; });
  rows_('감정').forEach(function (r) { if (!r['날짜']) return; const dd = day(r['날짜']); if (r['신호등'] === '초록') dd[5]++; if (r['신호등'] === '노랑') dd[6]++; if (r['신호등'] === '빨강') dd[7]++; });
  rows_('온도계').forEach(function (r) { if (r['날짜']) day(r['날짜'])[8] = Number(r['누적']) || 0; });
  let lastT = '';
  writeTable_('날짜별', Object.keys(days).sort().slice(-60).map(function (k) {
    const d = days[k]; if (d[8] === '') d[8] = lastT; lastT = d[8];
    return [k, Object.keys(d[1]).length, Object.keys(d[2]).length, Object.keys(d[3]).length, d[4], d[5], d[6], d[7], d[8]];
  }), force);
  drawChecks_(force);
  charts_();
  monthView_(force);
}
// 바뀐 게 없으면 시트에 다시 쓰지 않는다 (sync가 빨라지게)
function same_(key, data, force) {
  const s = JSON.stringify(data); let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  const cache = CacheService.getScriptCache(), k = 'w-' + key;
  if (!force && cache.get(k) === String(h)) return true;
  cache.put(k, String(h), 21600);
  return false;
}
function writeTable_(name, rows, force) {
  const sh = sheet_(name); if (!sh || same_(name, rows, force)) return;
  const w = TABS[name].length, last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, w).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, w).setValues(rows);
}
// 출석부처럼: 줄 = 학생, 칸 = 날짜(오늘이 맨 왼쪽). 한 칸 = 그날 했는지. 안 한 칸은 연분홍이라 한눈에 보인다
function drawChecks_(force) {
  const today = today_(), n = studentCount_(), names = studentMap_(), month = today.slice(0, 7);
  const rec = rows_('기록'), feel = rows_('감정');
  let first = today;
  rec.concat(feel).forEach(function (r) { if (r['날짜'] && r['날짜'] < first) first = r['날짜']; });
  const dates = [];
  for (let d = today; d >= first && dates.length < 120; d = addDays_(d, -1)) {
    const wd = new Date(d + 'T12:00:00').getDay();
    if (wd !== 0 && wd !== 6) dates.push(d);
  }
  const active = {};   // 아무 기록도 없는 평일 = 쉬는 날로 보고 회색
  rec.concat(feel).forEach(function (r) { active[r['날짜']] = 1; });
  active[today] = 1;
  CHECKS.forEach(function (c) {
    const sh = sheet_(c[0]); if (!sh) return;
    const cell = {}, sum = {};
    const put = function (no, d, v) { (cell[no] = cell[no] || {})[d] = v; };
    if (c[1] === '마음') feel.forEach(function (r) { put(Number(r['번호']), r['날짜'], r['신호등'] + '|' + (r['기분'] || r['신호등'])); });
    else rec.forEach(function (r) {
      if (r['종류'] !== c[1]) return;
      const no = Number(r['번호']), d = r['날짜'], old = (cell[no] || {})[d] || 0;
      put(no, d, old + 1);
    });
    const head = ['번호', '이름', '이번 달'].concat(dates.map(function (d) { return Number(d.slice(5, 7)) + '/' + Number(d.slice(8)) + ' (' + weekday_(d) + ')'; }));
    const vals = [head], bg = [head.map(function (_, j) { return j < 3 ? '#e9e6f5' : dates[j - 3] === today ? '#c7f0d6' : dates[j - 3].slice(0, 7) === month ? '#f1eff8' : '#f7f6fb'; })];
    for (let no = 1; no <= n; no++) {
      const row = [no, names[no] ? names[no].name : '', 0], rb = ['#ffffff', '#ffffff', '#faf9fd'];
      dates.forEach(function (d) {
        const v = (cell[no] || {})[d];
        if (v && d.slice(0, 7) === month) row[2]++;
        if (v) sum[d] = (sum[d] || 0) + 1;
        if (c[1] === '마음') { const p = v ? String(v).split('|') : null; row.push(p ? p[1] : ''); rb.push(p ? LIGHTS[p[0]] : active[d] ? '#ffffff' : '#f6f6f8'); }
        else { row.push(!v ? '' : c[1] === '발표' ? v : c[1] === '다했어요' && v > 1 ? '✓' + v : '✓'); rb.push(v ? c[2] : active[d] ? '#fff1f2' : '#f6f6f8'); }
      });
      vals.push(row); bg.push(rb);
    }
    vals.push(['', '하루 합계', ''].concat(dates.map(function (d) { return active[d] ? (sum[d] || 0) + '/' + n : '쉬는 날'; })));
    bg.push(vals[0].map(function () { return '#eef2ff'; }));
    if (same_(c[0], vals, force)) return;
    const W = vals[0].length, H = vals.length;
    sh.clear();
    if (sh.getMaxColumns() < W) sh.insertColumnsAfter(sh.getMaxColumns(), W - sh.getMaxColumns());
    const all = sh.getRange(1, 1, H, W);
    all.setValues(vals).setBackgrounds(bg).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontFamily('Noto Sans KR').setFontSize(10);
    sh.getRange(1, 1, 1, W).setFontWeight('bold').setWrap(true);
    sh.getRange(2, 1, H - 1, 2).setFontWeight('bold');
    sh.getRange(H, 1, 1, W).setFontWeight('bold').setFontColor('#46336e');
    if (c[1] !== '마음') sh.getRange(2, 4, H - 2, Math.max(1, W - 3)).setFontColor('#1f7a4a').setFontWeight('bold');
    sh.setFrozenRows(1); sh.setFrozenColumns(3);
    sh.setColumnWidth(1, 48); sh.setColumnWidth(2, 76); sh.setColumnWidth(3, 60);
    if (W > 3) sh.setColumnWidths(4, W - 3, c[1] === '마음' ? 74 : 62);
    sh.setRowHeight(1, 38);
    tidyTable_(sh, W, H, 28);
    sh.setTabColor(GROUP[c[0]]);
    guard2_(sh, c[0]);
  });
}
// 그래프는 한 번만 넣는다 (데이터가 바뀌면 저절로 따라 바뀐다)
function charts_() {
  const s1 = sheet_('학생별'), s2 = sheet_('날짜별'), n = studentCount_() + 1;
  if (s1 && s1.getCharts().length === 0) {
    s1.insertChart(s1.newChart().setChartType(Charts.ChartType.COLUMN).addRange(s1.getRange('A1:A' + n)).addRange(s1.getRange('F1:F' + n)).addRange(s1.getRange('C1:C' + n))
      .setPosition(2, 12, 0, 0).setOption('title', '이번 달 학생별 발표 · 우유').setOption('colors', ['#7566c0', '#93c5fd'])
      .setOption('legend', { position: 'top' }).setOption('width', 640).setOption('height', 320).build());
  }
  if (s2 && s2.getCharts().length === 0) {
    s2.insertChart(s2.newChart().setChartType(Charts.ChartType.LINE).addRange(s2.getRange('A1:A61')).addRange(s2.getRange('I1:I61'))
      .setPosition(2, 11, 0, 0).setOption('title', '학급 온도계').setOption('colors', ['#c9636d']).setOption('legend', { position: 'none' })
      .setOption('width', 600).setOption('height', 260).build());
    s2.insertChart(s2.newChart().setChartType(Charts.ChartType.COLUMN).addRange(s2.getRange('A1:A61')).addRange(s2.getRange('F1:H61'))
      .setPosition(16, 11, 0, 0).setOption('title', '날짜별 감정 신호등').setOption('isStacked', true).setOption('colors', ['#34d399', '#fbbf24', '#f87171'])
      .setOption('legend', { position: 'top' }).setOption('width', 600).setOption('height', 280).build());
    s2.insertChart(s2.newChart().setChartType(Charts.ChartType.COLUMN).addRange(s2.getRange('A1:A61')).addRange(s2.getRange('B1:B61')).addRange(s2.getRange('E1:E61'))
      .setPosition(31, 11, 0, 0).setOption('title', '날짜별 우유 · 발표').setOption('colors', ['#93c5fd', '#7566c0'])
      .setOption('legend', { position: 'top' }).setOption('width', 600).setOption('height', 260).build());
  }
}

// ── 월별 보기 (시트): '보는 달' · '보는 기록' 두 칸을 눌러 고르면 그 달 학생 × 날짜 표가 식으로 저절로 바뀐다 ──
//   앱이 지우고 다시 그리는 건 달이 바뀌거나 출결부 탭이 새로 생길 때뿐 (선생님이 고른 달 · 기록은 그대로 둔다)
//   원본 기록의 날짜: 앱판(kimman.kr)은 글자 '2026-10-13', 앱스 스크립트판은 날짜 값 → 찾는 조건을 판에 맞춘다
const MV = '월별 보기', MV_VER = 'mv5', MV_N = 40, MV_KINDS = ['우유', '다했어요', '1인1역', '발표', '마음', '출결'];
function monthView_(force) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(MV);
  if (!sh) { sh = ss.insertSheet(MV); force = true; }
  if (sh.getMaxColumns() < 37) sh.insertColumnsAfter(sh.getMaxColumns(), 37 - sh.getMaxColumns());   // 숨은 칸 AJ · AK 까지
  const month = today_().slice(0, 7);
  const att = ss.getSheets().map(function (x) { return x.getName(); }).filter(function (n) { return /^출결 \d{4}-\d{2}$/.test(n); }).sort().reverse().slice(0, 7);
  const stamp = [MV_VER, month, att.join(',')].join('|');
  if (!force && String(sh.getRange('AK1').getValue()) === stamp) return;
  const keepM = String(sh.getRange('B2').getValue() || ''), keepK = String(sh.getRange('F2').getValue() || '');
  const months = ['이번 달'];
  for (let i = 0; i < 24; i++) { const d = new Date(Number(month.slice(0, 4)), Number(month.slice(5)) - 1 - i, 1); months.push(d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월'); }
  const selM = months.indexOf(keepM) >= 0 ? keepM : '이번 달', selK = MV_KINDS.indexOf(keepK) >= 0 ? keepK : '우유';
  const L = function (c) { return colA1_(c); }, FIRST = 6, LAST = FIRST + MV_N - 1, TOT = LAST + 1;
  const DAYS = 'C$4:AG$4', DC = 'IF($AJ$2=1,' + DAYS + ',TEXT(' + DAYS + ',"yyyy-mm-dd")&"*")';
  // 날짜 칸이 앱판에서는 글자, 앱스 스크립트판에서는 날짜 값 — 숨은 AJ2 가 어느 쪽인지 보고 찾는 조건을 고른다
  const both = function (head) { return 'COUNTIFS(' + head + DC + ')'; };
  const nick = String(settings_()['학급 닉네임'] || '우리반');

  sh.clear();
  try { sh.getRange(1, 1, Math.min(sh.getMaxRows(), TOT + 3), Math.min(sh.getMaxColumns(), 36)).breakApart(); } catch (e) {}
  sh.setConditionalFormatRules([]);
  sh.getRange(1, 1, TOT + 3, 36).setFontFamily('Noto Sans KR').setFontSize(10).setVerticalAlignment('middle');
  // 1~3줄: 제목 · 고르는 칸 · 출결부 바로 가기
  sh.getRange('A1').setValue('  월별 보기').setFontSize(13).setFontWeight('bold').setFontColor('#ffffff').setBackground('#d9822b').setHorizontalAlignment('left').setWrap(false);
  sh.getRange('B1').setBackground('#d9822b');
  sh.getRange('C1:AH1').merge().setFormula('=IFERROR("' + nick.replace(/"/g, '') + '  ·  "&TEXT($AJ$1,"yyyy년 m월")&"  ·  "&$F$2,"' + nick.replace(/"/g, '') + '")')
    .setFontSize(15).setFontWeight('bold').setFontColor('#7a3f0b');
  sh.getRange('A2').setValue('보는 달');
  sh.getRange('B2').setNumberFormat('@').setValue(selM);
  sh.getRange('C2:E2').merge().setValue('보는 기록');
  sh.getRange('F2:I2').merge().setValue(selK);
  sh.getRange('J2:AH2').merge().setValue('← 노란 두 칸을 눌러 다른 달 · 다른 기록을 골라요.  인쇄: 파일 → 인쇄 → 가로 · 너비에 맞춤');
  sh.getRange('B2').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(months, true).setAllowInvalid(false).build());
  sh.getRange('F2').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(MV_KINDS, true).setAllowInvalid(false).build());
  sh.getRange('A2').setFontWeight('bold').setFontColor('#5b4a1e').setHorizontalAlignment('center');
  sh.getRange('C2').setFontWeight('bold').setFontColor('#5b4a1e').setHorizontalAlignment('center');
  [sh.getRange('B2'), sh.getRange('F2')].forEach(function (r) { r.setBackground('#fff3b0').setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center').setFontColor('#1f2937'); });
  sh.getRange('J2').setFontColor('#8a7a5c').setFontSize(9);
  sh.getRange('A3').setValue(att.length ? '출결부 바로 가기 →' : '출결부는 앱 [선생님 → 출결]에서 저장하면 달마다 탭으로 생겨요')
    .setFontWeight('bold').setFontColor('#9b2c3a').setFontSize(9).setWrap(false);
  att.forEach(function (n, i) {
    const c = 3 + i * 4, x = ss.getSheetByName(n);
    sh.getRange(3, c, 1, 4).merge().setFormula('=HYPERLINK("#gid=' + x.getSheetId() + '","' + Number(n.slice(8)) + '월 출결부 →")')
      .setBackground('#fde8ec').setFontColor('#9b2c3a').setFontWeight('bold').setHorizontalAlignment('center');
  });
  // 4~5줄: 날짜 · 요일
  const hd = [['번호', '이름'].concat(new Array(31).fill('')).concat(['합계'])];
  sh.getRange(4, 1, 1, 34).setValues(hd);
  sh.getRange(4, 3, 1, 31).setFormula('=IF($AJ$1+COLUMN()-3<EDATE($AJ$1,1),$AJ$1+COLUMN()-3,"")').setNumberFormat('d');
  sh.getRange(5, 3, 1, 31).setFormulas([new Array(31).fill(0).map(function (_, j) { const c = L(3 + j); return '=IF(' + c + '4="","",CHOOSE(WEEKDAY(' + c + '4),"일","월","화","수","목","금","토"))'; })]);
  sh.getRange('B5').setValue('요일');
  // 학생 줄
  sh.getRange('A' + FIRST).setFormula("=IFERROR(FILTER({'학생'!A2:A,'학생'!B2:B},'학생'!A2:A<>\"\",'학생'!D2:D<>\"아니오\"),\"\")");
  const K = function (r) { return both("'기록'!$C$2:$C,$F$2,'기록'!$D$2:$D,$A" + r + ",'기록'!$B$2:$B,"); };
  const F = function (r, col) { return both("'감정'!$E$2:$E,\"" + col + "\",'감정'!$C$2:$C,$A" + r + ",'감정'!$B$2:$B,"); };
  const A = function (r) { return 'IFERROR(VLOOKUP($A' + r + '&"|"&TEXT(' + DAYS + ',"yyyy-mm-dd"),{\'출결\'!$B$2:$B&"|"&IF(ISNUMBER(\'출결\'!$A$2:$A),TEXT(\'출결\'!$A$2:$A,"yyyy-mm-dd"),\'출결\'!$A$2:$A),\'출결\'!$F$2:$F},2,FALSE),"")'; };
  const rows = [], tot = [];
  for (let r = FIRST; r <= LAST; r++) {
    rows.push(['=IF($A' + r + '="","",ARRAYFORMULA(IF(' + DAYS + '="","",IF($F$2="출결",' + A(r) + ',IF($F$2="마음",IF(' + F(r, '빨강') + '>0,"빨강",IF(' + F(r, '노랑') + '>0,"노랑",IF(' + F(r, '초록') + '>0,"초록",""))),IF(' + K(r) + '>0,IF($F$2="발표",' + K(r) + ',"✓"),""))))))']);
    tot.push(['=IF($A' + r + '="","",IF($F$2="발표",SUM(C' + r + ':AG' + r + '),COUNTIF(C' + r + ':AG' + r + ',"?*")))']);
  }
  sh.getRange(FIRST, 3, MV_N, 1).setFormulas(rows);
  sh.getRange(FIRST, 34, MV_N, 1).setFormulas(tot);
  sh.getRange(TOT, 2).setValue('하루 합계');
  sh.getRange(TOT, 3, 1, 31).setFormulas([new Array(31).fill(0).map(function (_, j) { const c = L(3 + j); return '=IF(' + c + '$4="","",IF($F$2="발표",SUM(' + c + FIRST + ':' + c + LAST + '),COUNTIF(' + c + FIRST + ':' + c + LAST + ',"?*")))'; })]);
  sh.getRange(TOT, 34).setFormula('=SUM(AH' + FIRST + ':AH' + LAST + ')');
  sh.getRange(TOT + 2, 1).setValue('✓ 했어요 · 발표는 그날 횟수 · 마음은 그날 가장 힘든 색(빨강 > 노랑 > 초록) · 출결은 나이스 기호(결석 질병 ♡ · 미인정 ♥ · 지각 질병 # …)  ·  합계 = 한 날 수 (발표는 횟수 합)')
    .setFontSize(9).setFontColor('#77748c').setWrap(false);
  // 숨은 칸: 그 달 1일 · 다시 그릴 때를 알아보는 표시
  sh.getRange('AJ1').setFormula('=IFERROR(IF(OR($B$2="",$B$2="이번 달"),DATE(YEAR(TODAY()),MONTH(TODAY()),1),IF(ISNUMBER($B$2),DATE(YEAR($B$2),MONTH($B$2),1),DATE(VALUE(REGEXEXTRACT($B$2,"(\\d{4})")),VALUE(REGEXEXTRACT($B$2,"(\\d+)월")),1))),DATE(YEAR(TODAY()),MONTH(TODAY()),1))')
    .setNumberFormat('yyyy-mm-dd');
  sh.getRange('AJ2').setFormula("=IF(COUNT('기록'!B2:B)+COUNT('감정'!B2:B)>0,1,0)");
  sh.getRange('AK1').setValue(stamp);
  sh.hideColumns(36, 2);
  // 모양
  sh.getRange(4, 1, 2, 34).setBackground('#fbeedd').setFontWeight('bold').setHorizontalAlignment('center').setFontColor('#5b4a1e');
  sh.getRange(FIRST, 1, MV_N, 1).setHorizontalAlignment('center').setFontWeight('bold');
  sh.getRange(FIRST, 2, MV_N, 1).setFontWeight('bold');
  sh.getRange(FIRST, 3, MV_N + 1, 32).setHorizontalAlignment('center');
  sh.getRange(FIRST, 34, MV_N + 1, 1).setBackground('#fdf6ec').setFontWeight('bold').setFontColor('#7a3f0b');
  sh.getRange(TOT, 1, 1, 34).setBackground('#fbeedd').setFontWeight('bold').setFontColor('#5b4a1e').setHorizontalAlignment('center');
  sh.getRange(4, 1, TOT - 3, 34).setBorder(true, true, true, true, true, true, '#eadfcd', SpreadsheetApp.BorderStyle.SOLID);
  sh.setHiddenGridlines(true);
  sh.setFrozenRows(5); sh.setFrozenColumns(2);
  sh.setColumnWidth(1, 44); sh.setColumnWidth(2, 96); sh.setColumnWidths(3, 31, 30); sh.setColumnWidth(34, 52);
  sh.setRowHeight(1, 36); sh.setRowHeight(2, 30); sh.setRowHeight(3, 24); sh.setRowHeights(4, 2, 22); sh.setRowHeights(FIRST, MV_N + 1, 24);
  const g = sh.getRange(FIRST, 3, MV_N, 31), all = sh.getRange(4, 3, TOT - 3, 31), cf = function () { return SpreadsheetApp.newConditionalFormatRule(); };
  sh.setConditionalFormatRules([
    cf().whenTextEqualTo('✓').setBackground('#d3f2df').setFontColor('#1f7a4a').setRanges([g]).build(),
    cf().whenTextEqualTo('빨강').setBackground('#fee2e2').setFontColor('#b4232c').setRanges([g]).build(),
    cf().whenTextEqualTo('노랑').setBackground('#fef3c7').setFontColor('#92400e').setRanges([g]).build(),
    cf().whenTextEqualTo('초록').setBackground('#d1fae5').setFontColor('#047857').setRanges([g]).build(),
    cf().whenNumberGreaterThan(0).setBackground('#ede9fe').setFontColor('#5b21b6').setRanges([g]).build(),
    cf().whenFormulaSatisfied('=AND($F$2="출결",LEN(C' + FIRST + ')>0)').setBackground('#fde2e7').setFontColor('#b8323f').setRanges([g]).build(),
    cf().whenFormulaSatisfied('=OR(C$5="토",C$5="일")').setBackground('#eef0f4').setRanges([all]).build(),
  ]);
  sh.setTabColor(GROUP[MV]);
  guard2_(sh, '월별 보기', [sh.getRange('B2'), sh.getRange('F2')]);
}

// 앱이 다시 그리는 표: 경고만 보호 (고치려 하면 시트가 한 번 묻는다). keep = 고쳐도 되는 칸
function guard2_(sh, what, keep) {
  try {
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (p) { p.remove(); });
    const p = sh.protect().setWarningOnly(true).setDescription(what + ' — 앱이 기록을 보고 저절로 다시 그려요. 여기서 고쳐도 다시 그릴 때 사라져요');
    if (keep && keep.length) p.setUnprotectedRanges(keep);
  } catch (e) {}
}

// ── 선생님 서랍 '월별 기록': 한 달 치를 한 번에 (인쇄 · PDF 저장용) ─────────────
function monthData(code, pw, month) {
  guard_(code); tpw_(pw);
  month = /^\d{4}-\d{2}$/.test(String(month)) ? String(month) : today_().slice(0, 7);
  const names = studentMap_(), students = [];
  for (let i = 1; i <= studentCount_(); i++) students.push({ no: i, name: names[i] ? names[i].name : '' });
  const inM = function (d) { return String(d || '').slice(0, 7) === month; }, day = function (d) { return Number(String(d).slice(8, 10)); };
  const rec = {}, feel = {}, att = {}, rank = { '초록': 1, '노랑': 2, '빨강': 3 };
  rows_('기록').forEach(function (r) {
    if (!inM(r['날짜'])) return;
    const k = r['종류'], no = Number(r['번호']), d = day(r['날짜']);
    rec[k] = rec[k] || {}; rec[k][no] = rec[k][no] || {}; rec[k][no][d] = (rec[k][no][d] || 0) + 1;
  });
  rows_('감정').forEach(function (r) {
    if (!inM(r['날짜'])) return;
    const no = Number(r['번호']), d = day(r['날짜']), o = feel[no] = feel[no] || {};
    if (!o[d] || (rank[r['신호등']] || 0) >= (rank[o[d].l] || 0)) o[d] = { l: r['신호등'], m: r['기분'] };
  });
  rows_('출결').forEach(function (r) {
    if (!inM(r['날짜'])) return;
    const no = Number(r['번호']); (att[no] = att[no] || {})[day(r['날짜'])] = { k: r['종류'], s: r['구분'], sym: r['기호'], why: r['사유'] };
  });
  const s = settings_();
  return {
    month: month, today: today_(), nick: String(s['학급 닉네임'] || '우리반'), days: monthDays_(month), students: students,
    rec: rec, feel: feel, att: att, sym: ATT,
    notes: rows_('선생님노트').filter(function (r) { return inM(r['날짜']); }).map(function (r) { return { d: r['날짜'], no: r['번호'], name: r['이름'], cat: r['분류'], text: r['내용'] }; }),
    thermo: rows_('온도계').filter(function (r) { return inM(r['날짜']); }).map(function (r) { return { t: r['시각'], d: r['변화'], why: r['이유'], total: r['누적'] }; }),
  };
}

// ── 시트 메뉴 '앱 설정' (도움말 오른쪽) ─────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi().createMenu('앱 설정')
    .addItem('처음 상태로 다시 만들기 (예시 데이터 채우기)', 'resetAll')
    .addItem('예시 데이터만 지우기 (내 데이터는 그대로)', 'removeSamples')
    .addItem('기록 모두 비우기 (새 학기 시작)', 'clearRecords')
    .addSeparator()
    .addItem('설정 반영하기 (학생 수 · 계정 종류 → 탭)', 'applySettings')
    .addItem('체크표 · 학생별 · 그래프 새로 고치기', 'refreshAll')
    .addItem('이번 달 보고서 탭 만들기', 'monthReport')
    .addSeparator()
    .addItem('학생 · 계정 번호순 정렬', 'sortStudents')
    .addItem('선생님 노트 학생별로 모으기', 'sortNotes')
    .addItem('일정 날짜순 정렬', 'sortEvents')
    .addItem('원본 기록 탭 보이기 / 숨기기', 'toggleRaw')
    .addSeparator()
    .addItem('시트 다시 꾸미기 (색 · 탭 순서)', 'restyle')
    .addItem('웹 앱 주소 보기', 'showUrls')
    .addItem("'읽어 주세요' 탭 새로 만들기 (보안 안내 · 심의 근거)", 'readmeAgain')
    .addToUi();
}
// 설정 탭을 고치면 저절로: 학생 수 → 학생 · 계정 줄, 계정 종류 → 계정 탭 칸 (단순 트리거)
function onEdit(e) {
  try {
    const sh = e.range.getSheet();
    if (sh.getName() !== '설정' || e.range.getColumn() > 2) return;
    const key = String(sh.getRange(e.range.getRow(), 1).getValue()).trim();
    if (key === '계정 종류' || key === '학생 수') { _set = null; syncTabs_(true); SpreadsheetApp.getActiveSpreadsheet().toast("'" + key + "'에 맞춰 학생 · 계정 탭을 바꿨어요.", '앱 설정', 4); }
  } catch (err) {}
}
function applySettings() { _set = null; syncTabs_(true); SpreadsheetApp.getActiveSpreadsheet().toast('학생 수 · 계정 종류를 학생 · 계정 탭에 반영했어요.', '앱 설정', 4); }
function services_() { return list_('계정 종류', '아이톡톡'); }
function head_(name) {
  if (name !== '계정') return TABS[name];
  return ['번호', '이름'].concat([].concat.apply([], services_().map(function (sv) { return [sv + ' 아이디', sv + ' 비밀번호', sv + ' 힌트']; })));
}
// 학생 · 계정 탭을 설정에 맞춘다: 번호 1~학생 수 줄이 꼭 있게, 계정 칸은 '계정 종류'대로. 이미 적은 내용은 머리글 이름으로 찾아 그대로 옮긴다
function syncTabs_(force) {
  const n = studentCount_(), st = sheet_('학생'), ac = sheet_('계정');
  if (st) {
    const have = {};
    st.getDataRange().getValues().slice(1).forEach(function (r) { if (Number(r[0])) have[Number(r[0])] = 1; });
    const add = []; for (let i = 1; i <= n; i++) if (!have[i]) add.push([i, '', '', '예', '', '']);
    if (add.length) st.getRange(st.getLastRow() + 1, 1, add.length, 6).setValues(add);
  }
  if (!ac) return;
  const v = ac.getDataRange().getValues(), old = v[0].map(String), want = head_('계정');
  if (!force && old.join('|') === want.join('|') && v.length > n) return;
  const by = {};
  if (old.indexOf('서비스') >= 0) {   // v2 이전: 한 줄에 서비스 하나 → 한 줄에 학생 하나
    const iN = old.indexOf('번호'), iS = old.indexOf('서비스'), iI = old.indexOf('아이디'), iH = old.indexOf('힌트'), extra = [];
    v.slice(1).forEach(function (r) { const no = Number(r[iN]); if (!no) return; const sv = String(r[iS] || '').trim() || '아이톡톡';
      by[no] = by[no] || {}; by[no][sv + ' 아이디'] = r[iI]; by[no][sv + ' 힌트'] = r[iH]; if (services_().indexOf(sv) < 0 && extra.indexOf(sv) < 0) extra.push(sv); });
    if (extra.length) { setSetting_('계정 종류', services_().concat(extra).join(',')); want.length = 0; [].push.apply(want, head_('계정')); }
  } else {
    v.slice(1).forEach(function (r) { const no = Number(r[0]); if (!no) return; by[no] = {}; old.forEach(function (h, j) { by[no][h] = r[j]; }); });
    // 설정에서 뺀 계정 종류라도 적어 둔 아이디가 있으면 지우지 않고 남긴다 (칸을 비운 뒤 빼면 사라짐)
    const keep = [];
    old.forEach(function (h, j) {
      const m = /^(.+) (아이디|비밀번호|힌트)$/.exec(h); if (!m || want.indexOf(h) >= 0 || keep.indexOf(m[1]) >= 0) return;
      if (v.slice(1).some(function (r) { return String(r[j]).trim(); })) keep.push(m[1]);
    });
    if (keep.length) { setSetting_('계정 종류', services_().concat(keep).join(',')); want.length = 0; [].push.apply(want, head_('계정')); }
  }
  const names = studentMap_(), max = Math.max(n, Object.keys(by).reduce(function (a, k) { return Math.max(a, Number(k)); }, 0)), rows = [];
  for (let i = 1; i <= max; i++) {
    const o = by[i] || {};
    if (i > n && !Object.keys(o).some(function (h) { return h !== '번호' && h !== '이름' && o[h]; })) continue;
    rows.push(want.map(function (h) { return h === '번호' ? i : h === '이름' ? (names[i] ? names[i].name : o['이름'] || '') : o[h] != null && o[h] !== '' ? o[h] : / 힌트$/.test(h) && i <= n ? HINT_ASK : ''; }));
  }
  ac.clear();
  ac.getBandings().forEach(function (b) { b.remove(); });
  ac.getRange(1, 1, 1, want.length).setValues([want]);
  if (want.length > 2) ac.getRange(2, 3, rows.length + 60, want.length - 2).setNumberFormat('@');   // 아이디 0123 이 숫자로 바뀌지 않게
  if (rows.length) ac.getRange(2, 1, rows.length, want.length).setValues(rows);
  decorate_(ac, '계정');
}
function refreshAll() { _set = null; updateSummary(true); SpreadsheetApp.getActiveSpreadsheet().toast('체크표 · 학생별 · 날짜별을 새로 그렸어요.', '앱 설정', 4); }
function restyle() {
  CacheService.getScriptCache().remove('setup-v7'); setup();
  Object.keys(TABS).forEach(function (name) { if (sheet_(name)) decorate_(sheet_(name), name); });
  orderTabs_(); updateSummary(true);
}
function clearRecords() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('기록 모두 비우기', '체크표의 바탕이 되는 기록 · 온도계 · 감정과 쪽지 · 선생님노트 · 시간표변경 · 모둠을 지웁니다. 학생 · 계정 · 시간표 · 일정 · 설정은 그대로입니다. 계속할까요?',
    ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  ['기록', '온도계', '쪽지', '감정', '선생님노트', '시간표변경', '모둠'].forEach(function (name) {
    const sh = sheet_(name), last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, TABS[name].length).clearContent();
  });
  updateSummary(true);
  ui.alert('비웠습니다. 웹 앱을 열어 둔 창은 새로고침하세요.');
}
function resetAll() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('처음 상태로 다시 만들기', '이 파일의 탭을 모두 지우고 제작자가 만든 예시 데이터로 깔끔하게 새로 만듭니다. 학생 이름 · 기록 · 설정도 모두 처음으로 돌아갑니다. 계속할까요?',
    ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  // 두 번 눌러도 겹쳐 돌지 않게 잠그고, 지난번에 남은 '잠깐' 탭이 있으면 그대로 다시 쓴다
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) { ui.alert('이미 새로 만드는 중이에요. 잠시 뒤 시트를 새로고침해 주세요.'); return; }
  const ss = SpreadsheetApp.getActiveSpreadsheet(), cache = CacheService.getScriptCache();
  try {
    const tmp = ss.getSheetByName('잠깐') || ss.insertSheet('잠깐');
    tmp.showSheet(); ss.setActiveSheet(tmp);
    ss.getSheets().forEach(function (sh) { if (sh.getSheetId() !== tmp.getSheetId()) ss.deleteSheet(sh); });
    _set = null;
    ['setup-v7', 'weather'].concat(ORDER.map(function (n) { return 'w-' + n; })).forEach(function (k) { cache.remove(k); });
    setup_();
    ss.setActiveSheet(ss.getSheetByName('설정'));
    const left = ss.getSheetByName('잠깐');   // setup_ 이 이미 지웠을 수도 있다
    if (left) ss.deleteSheet(left);
  } catch (e) {
    ui.alert('다시 만드는 중에 문제가 생겼어요. ' + (e && e.message) + ' — 메뉴를 한 번 더 눌러 주세요. 그래도 안 되면 이 화면을 제작자에게 보내 주세요.');
    return;
  } finally { lock.releaseLock(); }
  ui.alert('새로 만들었습니다. 웹 앱을 열어 둔 창은 새로고침하세요.');
}
// 제작자가 넣어 둔 예시만 골라 지운다. 선생님이 넣은 이름 · 기록 · 노트는 그대로
function removeSamples() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('예시 데이터만 지우기', "설치한 날 전의 예시 기록, 예시 학생 이름 · 1인 1역 · 생일 · 계정, 예시 쪽지 · 노트 · 할 일 · 일정 · 시간표를 지웁니다. 선생님이 직접 넣은 것은 그대로 둡니다. 계속할까요?",
    ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  const msg = removeSamples_();
  ui.alert('예시를 지웠습니다.\n\n' + msg + '\n\n학생 이름은 학생 탭에, 시간표는 기초시간표 탭에 넣어 주세요.');
}
function removeSamples_() {
  _set = null;
  const s = settings_(), install = String(s['설치한 날'] || '2000-01-01'), smp = samples_(install), out = [];
  const keep = function (name, test) {
    const sh = sheet_(name), v = sh.getDataRange().getValues(), head = v.shift();
    const rows = v.filter(function (r) { return r.some(function (x) { return x !== ''; }); });
    const left = rows.filter(function (r) { const o = {}; head.forEach(function (h, j) { o[h] = text_(r[j], h); }); return test(o); });
    if (left.length === rows.length) return;
    if (rows.length) sh.getRange(2, 1, rows.length, head.length).clearContent();
    if (left.length) sh.getRange(2, 1, left.length, head.length).setValues(left);
    out.push(name + ' ' + (rows.length - left.length) + '줄');
  };
  ['기록', '감정', '온도계'].forEach(function (n) { keep(n, function (o) { return String(o['날짜']) >= install; }); });
  const sig = function (name, cols) { const m = {}; (smp[name] || []).forEach(function (r) { m[cols.map(function (j) { return String(r[j]); }).join('|')] = 1; }); return m; };
  [['쪽지', ['내용'], [3]], ['선생님노트', ['내용'], [5]], ['할일', ['할 일'], [2]], ['일정', ['일정'], [1]]].forEach(function (x) {
    const m = sig(x[0], x[2]); keep(x[0], function (o) { return !m[x[1].map(function (h) { return String(o[h]); }).join('|')]; });
  });
  const ac = sheet_('계정'), av = ac.getDataRange().getValues(); let acn = 0;
  for (let i = 1; i < av.length; i++) for (let j = 2; j < av[0].length; j++) {
    const x = String(av[i][j]);
    if (/^class62-\d\d(@example\.com)?$/.test(x) || /^student\d{1,2}@gne\.go\.kr$/.test(x) || /^Dream\d{4}!$/.test(x) || x === '처음 비밀번호는 선생님께 받은 카드' || SAMPLE_HINTS.indexOf(x) >= 0) { av[i][j] = ''; acn++; }
  }
  if (acn) { ac.getRange(1, 1, av.length, av[0].length).setValues(av); out.push('계정 예시 ' + acn + '칸'); }
  syncTabs_(true);
  // 학생: 예시 이름 · 역할 · 생일만 비운다 (번호 · 사용은 그대로)
  const st = sheet_('학생'), sv = st.getDataRange().getValues(), sh0 = sv[0];
  const ci = function (h) { return sh0.indexOf(h); };
  let cleared = 0;
  for (let i = 1; i < sv.length; i++) {
    const no = Number(sv[i][0]), ex = smp['학생'][no - 1]; if (!ex) continue;
    const jn = ci('이름'), wasSample = jn >= 0 && text_(sv[i][jn], '이름') === String(ex[1]);
    [['이름', 1], ['1인 1역', 2], ['생일', 4]].forEach(function (p) { const j = ci(p[0]); if (j >= 0 && text_(sv[i][j], p[0]) === String(ex[p[1]])) { sv[i][j] = ''; cleared++; } });
    const js = ci('성별'); if (wasSample && js >= 0 && String(sv[i][js]) === String(ex[5] || '')) { sv[i][js] = ''; cleared++; }
  }
  if (cleared) { st.getRange(1, 1, sv.length, sh0.length).setValues(sv); out.push('학생 예시 ' + cleared + '칸'); }
  // 기초시간표가 예시 그대로면 과목만 비운다 (교시 · 시각은 남김)
  const tt = sheet_('기초시간표'), tv = tt.getRange(2, 1, 7, 7).getValues();
  if (tv.every(function (r, i) { return r.slice(2).map(String).join() === SAMPLE_TT[i].slice(2).join(); })) {
    tt.getRange(2, 3, 7, 5).clearContent(); out.push('기초시간표 과목');
  }
  if (s['학급 닉네임'] === '꿈을 키우는 6학년 2반') { setSetting_('학급 닉네임', '우리반'); out.push('학급 닉네임'); }
  // 온도계 누적을 남은 기록으로 다시 셈
  const th = sheet_('온도계'), hv = th.getDataRange().getValues();
  let tot = 0;
  for (let i = 1; i < hv.length; i++) { if (hv[i].every(function (x) { return x === ''; })) continue; const d = Number(hv[i][2]) || 0; tot = d === 0 && String(hv[i][3]).indexOf('새 출발') >= 0 ? 0 : Math.max(0, tot + d); hv[i][4] = tot; }
  if (hv.length > 1) th.getRange(1, 1, hv.length, 5).setValues(hv);
  ORDER.forEach(function (n) { CacheService.getScriptCache().remove('w-' + n); });
  updateSummary(true);
  return out.length ? '지운 것: ' + out.join(', ') : '지울 예시가 없었어요.';
}
// 이번 달 보고서: 학생마다 한 달 동안 한 일을 한 장으로 (상담 · 생활기록 참고용)
function monthReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), month = today_().slice(0, 7), name = '보고서 ' + month;
  const old = ss.getSheetByName(name); if (old) ss.deleteSheet(old);
  const sh = ss.insertSheet(name, ss.getSheets().length);
  const head = ['번호', '이름', '우유', '다 했어요', '1인 1역', '발표', '마음 초록', '마음 노랑', '마음 빨강', '선생님 노트'];
  const rows = tally_(month).map(function (o) { return [o.no, o.name, o.milk, o.done, o.role, o.talk, o.g, o.y, o.r, o.notes]; });
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#b3831f').setHorizontalAlignment('center');
  if (rows.length) sh.getRange(2, 1, rows.length, head.length).setValues(rows).setHorizontalAlignment('center');
  sh.getRange(rows.length + 2, 1, 1, 2).setValues([['', '합계']]);
  for (let c = 3; c <= head.length; c++) sh.getRange(rows.length + 2, c).setFormula('=SUM(' + colA1_(c) + '2:' + colA1_(c) + (rows.length + 1) + ')');
  sh.getRange(rows.length + 2, 1, 1, head.length).setFontWeight('bold').setBackground('#fdf3dc').setHorizontalAlignment('center');
  sh.setFrozenRows(1); sh.setColumnWidths(1, head.length, 82); sh.setTabColor('#b3831f');
  sh.getRange(1, 1, rows.length + 2, head.length).setFontFamily('Noto Sans KR');
  sh.insertChart(sh.newChart().setChartType(Charts.ChartType.BAR).addRange(sh.getRange(1, 2, rows.length + 1, 1)).addRange(sh.getRange(1, 3, rows.length + 1, 4))
    .setPosition(2, head.length + 2, 0, 0).setOption('title', month + ' 학생별 활동').setOption('isStacked', true)
    .setOption('colors', ['#93c5fd', '#86efac', '#fcd34d', '#a78bfa']).setOption('legend', { position: 'top' }).setOption('width', 620).setOption('height', 560).build());
  ss.setActiveSheet(sh);
  ss.toast("'" + name + "' 탭을 만들었어요. 인쇄 · PDF로 저장해도 돼요.", '앱 설정', 5);
}
function colA1_(c) { let s = ''; while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; }
function sortRange_(name, spec) { const sh = sheet_(name), last = sh.getLastRow(); if (last > 2) sh.getRange(2, 1, last - 1, head_(name).length).sort(spec); }
function sortStudents() { sortRange_('학생', [{ column: 1, ascending: true }]); sortRange_('계정', [{ column: 1, ascending: true }]); SpreadsheetApp.getActiveSpreadsheet().toast('번호순으로 정렬했어요.', '앱 설정', 3); }
function sortNotes() { sortRange_('선생님노트', [{ column: 3, ascending: true }, { column: 1, ascending: false }]); SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet_('선생님노트')); }
function sortEvents() { sortRange_('일정', [{ column: 1, ascending: true }]); SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet_('일정')); }
function toggleRaw() {
  const hidden = sheet_('기록').isSheetHidden();
  RAW.forEach(function (n) { const sh = sheet_(n); if (hidden) sh.showSheet(); else sh.hideSheet(); });
  SpreadsheetApp.getActiveSpreadsheet().toast(hidden ? '원본 기록 탭(기록 · 감정 · 온도계)을 보이게 했어요. 웹 앱이 쓰는 곳이라 고치지 않는 게 좋아요.' : '원본 기록 탭을 숨겼어요.', '앱 설정', 5);
}
function showUrls() {
  const url = ScriptApp.getService().getUrl();
  SpreadsheetApp.getUi().alert('웹 앱 주소', url ? '바탕화면: ' + url + '\n\n이 주소는 선생님만 쓰세요. 시트와 웹 앱 주소를 학생에게 공유하지 마세요.' : '아직 배포하지 않았어요. 확장 프로그램 > Apps Script > 배포 > 새 배포 > 웹 앱', SpreadsheetApp.getUi().ButtonSet.OK);
}

// ── 읽기 ─────────────────────────────────────────────────────
function getAll(code) {
  guard_(code);
  setup();
  const s = settings_(), today = today_(), n = studentCount_();
  const names = studentMap_(), students = [], md = today.slice(5);
  for (let i = 1; i <= n; i++) students.push({ no: i, name: names[i] ? names[i].name : '', role: names[i] ? names[i].role : '', sex: names[i] ? names[i].sex : '' });
  const act = String(s['지금 활동'] || '');
  const milk = {}, done = {}, role = {}, talk = {}, feel = {}, named = {}; let namedDay = 0;
  tail_('기록', 1500).forEach(function (r) {
    if (r['날짜'] !== today) return;
    const no = Number(r['번호']), k = r['종류'];
    if (k === '우유') milk[no] = 1;
    if (k === '다했어요' && r['내용'] === act) done[no] = 1;
    if (k === '1인1역') role[no] = 1;
    if (k === '발표') talk[no] = (talk[no] || 0) + 1;
    if ((k === '수업방해' || k === '이름') && String(r['내용'] || '').indexOf('해제') < 0) named[no] = 1;
    if (k === '수업방해' || k === '이름') namedDay++;
  });
  tail_('감정', 300).forEach(function (r) { if (r['날짜'] === today) feel[Number(r['번호'])] = 1; });   // 누가 했는지만 (색은 선생님만)
  const th = tail_('온도계', 8);
  const rw = thermoRewards_(), thermo = { total: th.length ? Number(th[th.length - 1]['누적']) || 0 : 0, goal: rw.length ? rw[rw.length - 1].at : Number(s['온도계 목표']) || 100, rewards: rw, rules: thermoRules_(), week: roleWeek_(mondayOf_(today), today, true),
    recent: th.slice(-4).reverse().map(function (r) { return { t: r['시각'], d: Number(r['변화']) || 0, why: r['이유'] }; }) };
  const quotes = rows_('명언').filter(function (r) { return r['글귀']; });
  const doy = Math.floor((new Date(today + 'T12:00:00') - new Date(today.slice(0, 4) + '-01-01T12:00:00')) / 86400000);
  const quote = quotes.length ? quotes[doy % quotes.length] : null;
  const pub = {};
  Object.keys(s).forEach(function (k) { if (k !== '선생님 비밀번호' && k !== '자리 저장') pub[k] = s[k]; });
  const bday = Object.keys(names).filter(function (no) { return Number(no) <= n && mmdd_(names[no].bday) === md; }).map(Number);
  return {
    settings: pub, today: today, weekday: weekday_(today), students: students, birthday: bday,
    marks: { milk: milk, done: done, role: role, talk: talk, feel: feel, name: named, nameDay: namedDay, act: act },
    thermo: thermo, tt: timetable_(today), subjects: list_('과목', '국어,도덕,수학,사회,과학,음악,미술,실과,체육,영어,창체'),
    praise: list_('칭찬 이유', '바른 인사,협동,정리정돈,발표,배려,집중'),
    quote: quote ? { text: quote['글귀'], who: quote['누가'] } : null,
    notice: noticeOf_(today),
    todos: rows_('할일').filter(function (r) { return r['할 일'] && (r['날짜'] === today || r['완료'] !== '예'); }),
    memos: tail_('쪽지', 6).reverse(),
    events: rows_('일정').filter(function (r) { return r['날짜'] && r['일정']; }).map(function (r) { return { d: r['날짜'], t: r['일정'], k: r['종류'] }; }),
    layout: String(s['배치'] || ''), seats: String(s['자리 저장'] || ''), sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    feedback: !!FEEDBACK_URL, version: VERSION,
  };
}
function sync(code) {
  guard_(code);
  locked_(function () { updateSummary(); });
  return getAll(code);
}
// 기초시간표: 줄 = 교시(시각), 칸 = 월~금. 시각이 적힌 줄만 교시로 센다
function timetable_(day) {
  const rows = rows_('기초시간표'), base = { '월': [], '화': [], '수': [], '목': [], '금': [] };
  rows.forEach(function (r) { Object.keys(base).forEach(function (d) { base[d].push(r[d] || ''); }); });
  let times = rows.map(function (r) { return String(r['시각'] || '').trim(); });
  while (times.length && !times[times.length - 1]) times.pop();
  if (!times.length) times = String(settings_()['교시 시각'] || '').split(',').map(function (x) { return x.trim(); }).filter(String);
  times = times.slice(0, 7);
  const wd = weekday_(day), over = rows_('시간표변경').filter(function (r) { return r['날짜'] === day; })[0];
  const list = over ? [1, 2, 3, 4, 5, 6, 7].map(function (i) { return over[i + '교시'] || ''; }) : (base[wd] || []);
  return { periods: times.map(function (t, i) { return { n: i + 1, time: t, subj: list[i] || '' }; }), changed: !!over, base: base, count: times.length };
}

// ── 번호판 ─────────────────────────────────────────────────────
function tap(code, kind, no) {
  guard_(code);
  if (['우유', '다했어요', '1인1역'].indexOf(kind) < 0) throw new Error('알 수 없는 종류예요: ' + kind);
  no = checkNo_(no);
  return locked_(function () {
    const st = studentMap_()[no] || { name: '', role: '' }, today = today_();
    const content = kind === '다했어요' ? String(settings_()['지금 활동'] || '') : kind === '1인1역' ? st.role : '';
    const hit = tail_('기록', 1500).reverse().filter(function (r) {
      return r['날짜'] === today && r['종류'] === kind && Number(r['번호']) === no && (kind !== '다했어요' || r['내용'] === content);
    })[0];
    if (hit) { sheet_('기록').deleteRow(hit._row); return { ok: true, on: false }; }
    sheet_('기록').appendRow([now_(), today, kind, no, st.name, content]);
    return { ok: true, on: true };
  });
}
function present(code, no) {
  guard_(code); no = checkNo_(no);
  return locked_(function () { sheet_('기록').appendRow([now_(), today_(), '발표', no, (studentMap_()[no] || { name: '' }).name, '']); });
}
function undoPresent(code, no) {
  guard_(code); no = checkNo_(no);
  return locked_(function () {
    const today = today_();
    const hit = tail_('기록', 1500).reverse().filter(function (r) { return r['날짜'] === today && r['종류'] === '발표' && Number(r['번호']) === no; })[0];
    if (hit) sheet_('기록').deleteRow(hit._row);
  });
}
// 감정 신호등: 하루에 한 번 (다시 하면 바뀐다)
function feel(code, no, light, mood, note) {
  guard_(code); no = checkNo_(no);
  if (!LIGHTS[light]) throw new Error('신호등은 초록 · 노랑 · 빨강 중에서 골라요.');
  return locked_(function () {
    const today = today_(), sh = sheet_('감정');
    tail_('감정', 300).reverse().filter(function (r) { return r['날짜'] === today && Number(r['번호']) === no; })
      .forEach(function (r) { sh.deleteRow(r._row); });
    sh.appendRow([now_(), today, no, (studentMap_()[no] || { name: '' }).name, light, String(mood || '').slice(0, 10), String(note || '').slice(0, 60)]);
  });
}

// ── 학급 온도계 ──────────────────────────────────────────────
function thermo(code, delta, reason) {
  guard_(code);
  delta = Math.round(Number(delta));
  if (!delta || Math.abs(delta) > 50) throw new Error('온도는 한 번에 -50 ~ +50까지예요.');
  return locked_(function () {
    const th = tail_('온도계', 1), total = Math.max(0, (th.length ? Number(th[0]['누적']) || 0 : 0) + delta);
    sheet_('온도계').appendRow([now_(), today_(), delta, String(reason || '').slice(0, 40), total]);
    return { ok: true, total: total };
  });
}
function thermoReset(code, pw) {
  guard_(code); tpw_(pw);
  return locked_(function () { sheet_('온도계').appendRow([now_(), today_(), 0, '새 출발 (0도부터)', 0]); });
}

// ── 쪽지 · 오늘 할 일 · 일정 ─────────────────────────────────────
function addMemo(code, who, text) {
  guard_(code);
  text = String(text || '').trim().slice(0, 80);
  if (!text) throw new Error('남길 말을 적어 주세요.');
  return locked_(function () { const no = nextNo_('쪽지'); sheet_('쪽지').appendRow([no, now_(), String(who || '').slice(0, 10), text]); return { ok: true, no: no }; });
}
function delMemo(code, pw, no) { guard_(code); tpw_(pw); return locked_(function () { const sh = sheet_('쪽지'); sh.deleteRow(findRow_(sh, no)); }); }
function addTodo(code, pw, text) {
  guard_(code); tpw_(pw);
  text = String(text || '').trim().slice(0, 60);
  if (!text) throw new Error('할 일을 적어 주세요.');
  return locked_(function () { const no = nextNo_('할일'); sheet_('할일').appendRow([no, today_(), text, '아니오']); return { ok: true, no: no }; });
}
function toggleTodo(code, no) {
  guard_(code);
  return locked_(function () {
    const sh = sheet_('할일'), r = findRow_(sh, no), done = String(sh.getRange(r, 4, 1, 1).getValues()[0][0]) === '예';
    sh.getRange(r, 4, 1, 1).setValues([[done ? '아니오' : '예']]);
  });
}
function delTodo(code, pw, no) { guard_(code); tpw_(pw); return locked_(function () { const sh = sheet_('할일'); sh.deleteRow(findRow_(sh, no)); }); }
function addEvent(code, pw, date, text, kind) {
  guard_(code); tpw_(pw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !String(text || '').trim()) throw new Error('날짜와 일정을 적어 주세요.');
  return locked_(function () { sheet_('일정').appendRow([date, String(text).trim().slice(0, 30), kind || '행사']); });
}

// ── 내 계정 확인 ─────────────────────────────────────────────
function getAccount(code, no) {
  guard_(code);
  if (settings_()['계정 확인'] === '아니오') throw new Error('계정 확인이 꺼져 있어요.');
  no = checkNo_(no);
  const row = rows_('계정').filter(function (r) { return Number(r['번호']) === no; })[0] || {};
  // 비밀번호 칸은 읽지도 내보내지도 않는다 — 학생 화면에는 아이디 · 힌트만
  return services_().map(function (sv) { return { service: sv, id: row[sv + ' 아이디'] || '', hint: row[sv + ' 힌트'] || '' }; }).filter(function (a) { return a.id || a.hint; });
}

// ── 선생님 모드 ──────────────────────────────────────────────
function checkTeacher(code, pw) { guard_(code); tpw_(pw); return { ok: true }; }
// 선생님 비밀번호 바꾸기 (지금 비밀번호를 알아야 한다)
function changePw(code, pw, next) {
  guard_(code); tpw_(pw);
  next = String(next || '').trim();
  if (!/^\S{4,20}$/.test(next)) throw new Error('새 비밀번호는 띄어쓰기 없이 4~20자로 적어 주세요.');
  if (next === '1234') throw new Error('처음 비밀번호(1234)와 다르게 정해 주세요.');
  return locked_(function () { setSetting_('선생님 비밀번호', next); return { ok: true }; });
}
// 비밀번호를 잊었을 때: 이 시트 주인(선생님 구글 계정)의 메일로 보낸다. 받는 곳은 바꿀 수 없다 — 누르는 사람이 아니라 시트 주인에게만 간다
function mailPw(code) {
  guard_(code);
  const cache = CacheService.getScriptCache(), n = Number(cache.get('pwmail') || 0);
  if (n >= 3) throw new Error('메일은 한 시간에 세 번까지 보낼 수 있어요. 받은편지함과 스팸함을 먼저 확인해 주세요.');
  const to = Session.getEffectiveUser().getEmail();
  if (!to) throw new Error('보낼 메일 주소를 알 수 없어요. 구글 시트 > 설정 탭의 선생님 비밀번호 칸을 확인해 주세요.');
  cache.put('pwmail', String(n + 1), 3600);
  const s = settings_();
  const nick = String(s['학급 닉네임'] || '우리반'), pw = String(s['선생님 비밀번호'] || '1234');
  MailApp.sendEmail({ to: to, subject: '[우리반 바탕화면] 선생님 비밀번호 안내', name: '우리반 바탕화면',
    body: pwMailText_(nick, pw), htmlBody: pwMailHtml_(nick, pw, SpreadsheetApp.getActiveSpreadsheet().getUrl()) });
  return { ok: true, to: maskMail_(to) };
}
// 비밀번호 안내 메일 — HTML 로 보낸다 (글자만 보내면 Gmail 이 긴 줄을 끊고, 괄호까지 링크로 묶는다)
function pwMailHtml_(nick, pw, sheet) {
  const e = function (x) { return String(x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const li = 'margin:0 0 8px';
  return '<div style="font-family:\'Malgun Gothic\',\'Apple SD Gothic Neo\',sans-serif;font-size:15px;line-height:1.7;color:#222;word-break:keep-all;max-width:560px">' +
    '<p style="margin:0 0 12px">선생님, <b>우리반 바탕화면</b>(' + e(nick) + ')에서 <b>[비밀번호를 잊었어요]</b>를 눌러 이 메일이 왔어요.</p>' +
    '<div style="background:#f3f0fc;border-radius:12px;padding:14px 18px;margin:0 0 16px"><div style="color:#6b6880;font-size:13px">선생님 비밀번호</div>' +
    '<div style="font-size:26px;font-weight:700;letter-spacing:2px;color:#46336e">' + e(pw) + '</div></div>' +
    '<ul style="margin:0 0 16px;padding-left:20px">' +
    '<li style="' + li + '">바탕화면 [선생님] → 서랍 → 설정 → <b>선생님 비밀번호 바꾸기</b>에서 새로 정할 수 있어요.</li>' +
    '<li style="' + li + '">시트에서는 설정 탭의 \'선생님 비밀번호\' 칸이에요.' + (sheet ? ' <a href="' + e(sheet) + '" style="color:#5a4aa8">시트 열기</a>' : '') + '</li>' +
    '<li style="' + li + '">직접 누르지 않았다면 교실에서 누군가 눌렀을 수 있어요. 메일은 시트 주인(선생님)에게만 가지만, 한 번 바꿔 두면 더 안전해요.</li></ul>' +
    '<p style="margin:0;color:#888;font-size:12.5px">우리반 바탕화면(<a href="https://kimman.kr/desk" style="color:#888">kimman.kr/desk</a>)이 보낸 자동 안내예요. ' +
    '비밀번호는 어디에도 저장하지 않아요. <a href="https://kimman.kr/desk/privacy" style="color:#888">개인정보처리방침</a></p></div>';
}
// HTML 을 못 여는 메일 프로그램용 (짧은 줄, 주소는 앞뒤를 띄운다)
function pwMailText_(nick, pw) {
  return '우리반 바탕화면(' + nick + ') 선생님 비밀번호 안내\n\n선생님 비밀번호: ' + pw +
    '\n\n바꾸기: 바탕화면 [선생님] → 서랍 → 설정 → 선생님 비밀번호 바꾸기\n\n안내 : https://kimman.kr/desk/privacy \n';
}
function maskMail_(m) { const p = String(m).split('@'); return p.length < 2 ? '' : p[0].slice(0, 2) + '***@' + p[1]; }
// 시트가 다른 사람에게 공유되어 있는지 (선생님 서랍 > 보안 · 심의). 앱스 스크립트판은 사람 단위 공유만 보인다
function shareInfo(code, pw) {
  guard_(code); tpw_(pw);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let owner = '', people = [];
  try { owner = ss.getOwner() ? ss.getOwner().getEmail() : ''; } catch (e) {}
  try { ss.getEditors().concat(ss.getViewers()).forEach(function (u) { const m = u.getEmail(); if (m && m !== owner && people.indexOf(m) < 0) people.push(m); }); } catch (e) {}
  return { known: true, link: null, people: people, owner: maskMail_(owner) };
}
function teacher(code, pw) {
  guard_(code); tpw_(pw);
  const today = today_(), n = studentCount_(), act = String(settings_()['지금 활동'] || ''), names = studentMap_(), day = {};
  for (let i = 1; i <= n; i++) day[i] = { no: i, name: names[i] ? names[i].name : '', milk: 0, done: 0, role: 0, talk: 0, light: '', mood: '', note: '' };
  tail_('기록', 1500).forEach(function (r) {
    const o = day[Number(r['번호'])]; if (!o || r['날짜'] !== today) return;
    if (r['종류'] === '우유') o.milk = 1;
    if (r['종류'] === '다했어요' && r['내용'] === act) o.done = 1;
    if (r['종류'] === '1인1역') o.role = 1;
    if (r['종류'] === '발표') o.talk++;
  });
  tail_('감정', 300).forEach(function (r) { const o = day[Number(r['번호'])]; if (o && r['날짜'] === today) { o.light = r['신호등']; o.mood = r['기분']; o.note = r['한마디']; } });
  return { today: Object.keys(day).map(function (k) { return day[k]; }), notes: tail_('선생님노트', 200).reverse(),
    base: timetable_(today).base, settings: settings_() };
}
function addNote(code, pw, no, cat, text) {
  guard_(code); tpw_(pw);
  text = String(text || '').trim().slice(0, 300);
  if (!text) throw new Error('노트 내용을 적어 주세요.');
  no = Number(no) || '';
  return locked_(function () {
    const st = no ? (studentMap_()[no] || { name: '' }) : { name: '' };
    sheet_('선생님노트').appendRow([now_(), today_(), no, st.name, String(cat || '관찰').slice(0, 10), text]);
  });
}
function saveLayout(code, pw, json) { guard_(code); tpw_(pw); JSON.parse(json); return locked_(function () { setSetting_('배치', String(json).slice(0, 5000)); }); }
function saveSetting(code, pw, key, value) {
  guard_(code); tpw_(pw);
  if (SETTABLE.indexOf(key) < 0) throw new Error('여기서는 바꿀 수 없는 항목이에요: ' + key);
  value = String(value == null ? '' : value).trim().slice(0, 300);
  if (key === '학생 수' && !(Number(value) >= 1 && Number(value) <= 40)) throw new Error('학생 수는 1 ~ 40명이에요.');
  if (key === '지금 활동' && !value) throw new Error('활동 이름을 적어 주세요.');
  let place = null;
  if (key === '날씨 지역') { place = geocode_(value); if (!place) throw new Error("'" + value + "' 지역을 찾지 못했어요. 시 · 구 · 동 이름으로 다시 적어 보세요."); }
  return locked_(function () {
    setSetting_(key, value);
    if (place) { setSetting_('위도', String(place.lat)); setSetting_('경도', String(place.lon)); CacheService.getScriptCache().remove('weather'); }
    if (key === '계정 종류' || key === '학생 수') syncTabs_(true);
    return { ok: true, place: place };
  });
}
// 교실 컴퓨터의 위치(브라우저가 알려 준 위도 · 경도)로 날씨 · 미세먼지 위치를 바꾼다
function saveLocation(code, pw, lat, lon, name) {
  guard_(code); tpw_(pw);
  lat = Math.round(Number(lat) * 100) / 100; lon = Math.round(Number(lon) * 100) / 100;
  if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180)) throw new Error('위치를 알 수 없어요.');
  return locked_(function () {
    setSetting_('위도', String(lat)); setSetting_('경도', String(lon)); setSetting_('날씨 지역', String(name || '현재 위치').slice(0, 40));
    CacheService.getScriptCache().remove('weather');
  });
}
// 지역 이름 → 위도 · 경도 (Open-Meteo 지명 검색, 키 필요 없음)
function geocode_(name) {
  const parts = String(name).trim().split(/\s+/).filter(String);
  const stem = function (x) { return String(x).replace(/(특별자치시|특별자치도|특별시|광역시|도|시|구|군)$/, ''); };
  for (let i = parts.length - 1; i >= 0; i--) {
    const hints = parts.slice(0, i).map(stem).filter(String);
    try {
      const j = JSON.parse(UrlFetchApp.fetch('https://geocoding-api.open-meteo.com/v1/search?count=30&language=ko&name=' + encodeURIComponent(parts[i]), { muteHttpExceptions: true }).getContentText());
      const kr = (j.results || []).filter(function (r) { return r.country_code === 'KR'; });
      const hit = kr.filter(function (r) { const where = [r.admin1, r.admin2, r.admin3, r.admin4].join(' ');
        return hints.every(function (h) { return where.indexOf(h) >= 0; }); })[0] || (hints.length ? null : kr[0]);
      if (hit) return { lat: Math.round(hit.latitude * 100) / 100, lon: Math.round(hit.longitude * 100) / 100, name: hit.name };
    } catch (e) {}
  }
  return null;
}
function saveTimetable(code, pw, mode, data) {
  guard_(code); tpw_(pw);
  const clean = function (list) { return [0, 1, 2, 3, 4, 5, 6].map(function (i) { return String((list || [])[i] || '').slice(0, 10); }); };
  return locked_(function () {
    const today = today_();
    if (mode === 'today' || mode === 'reset') {
      const sh = sheet_('시간표변경'), v = sh.getDataRange().getValues();
      for (let i = v.length - 1; i >= 1; i--) if (text_(v[i][0], '날짜') === today) sh.deleteRow(i + 1);
      if (mode === 'today') sh.appendRow([today].concat(clean(data)));
    } else if (mode === 'base') {
      const days = ['월', '화', '수', '목', '금'], cols = days.map(function (d) { return clean(data[d]); });
      sheet_('기초시간표').getRange(2, 3, 7, 5).setValues([0, 1, 2, 3, 4, 5, 6].map(function (i) { return cols.map(function (c) { return c[i]; }); }));
    } else throw new Error('알 수 없는 시간표 저장 방식이에요.');
  });
}

// ── 출결 (선생님만): 나이스처럼 종류 × 구분 기호. 한 학생 하루 한 칸. 시트 '출결'(원본)과 '출결 2026-10'(월별 표) ─────────
function attendGet(code, pw, month) {
  guard_(code); tpw_(pw);
  month = /^\d{4}-\d{2}$/.test(String(month)) ? String(month) : today_().slice(0, 7);
  const recs = {};
  rows_('출결').forEach(function (r) { if (String(r['날짜']).slice(0, 7) === month) recs[Number(r['번호']) + '|' + r['날짜']] = { kind: r['종류'], sub: r['구분'], sym: r['기호'], reason: r['사유'] }; });
  const names = studentMap_(), students = [];
  for (let i = 1; i <= studentCount_(); i++) students.push({ no: i, name: names[i] ? names[i].name : '' });
  return { month: month, days: monthDays_(month), recs: recs, students: students, today: today_() };
}
function monthDays_(month) {
  const hol = {};
  rows_('일정').forEach(function (r) { if (r['종류'] === '휴일' && r['날짜']) hol[r['날짜']] = r['일정']; });
  const y = Number(month.slice(0, 4)), m = Number(month.slice(5)), n = new Date(y, m, 0).getDate(), out = [];
  for (let d = 1; d <= n; d++) {
    const ymd = month + '-' + ('0' + d).slice(-2), wd = new Date(y, m - 1, d).getDay();
    out.push({ d: ymd, wd: '일월화수목금토'[wd], off: wd === 0 || wd === 6, hol: hol[ymd] || '' });
  }
  return out;
}
// list = [{no, date, kind, sub, reason}] — 같은 학생 · 같은 날은 바꿔 쓰기. clear 이면 지우기
function attendSave(code, pw, list, clear) {
  guard_(code); tpw_(pw);
  list = (list || []).slice(0, 400).map(function (x) {
    const no = checkNo_(x.no), date = String(x.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('날짜가 이상해요: ' + date);
    if (!clear && !(ATT[x.kind] && ATT[x.kind][x.sub])) throw new Error('출결 종류를 골라 주세요.');
    return { no: no, date: date, kind: x.kind, sub: x.sub, reason: String(x.reason || '').slice(0, 200) };
  });
  return locked_(function () {
    const sh = sheet_('출결'), v = sh.getDataRange().getValues(), key = {}, months = {};
    list.forEach(function (x) { key[x.no + '|' + x.date] = 1; months[x.date.slice(0, 7)] = 1; });
    const keep = v.slice(1).filter(function (r) { return r.some(function (c) { return c !== ''; }) && !key[Number(r[1]) + '|' + text_(r[0], '날짜')]; });
    const names = studentMap_(), now = now_();
    const add = clear ? [] : list.map(function (x) { return [x.date, x.no, names[x.no] ? names[x.no].name : '', x.kind, x.sub, safe_(ATT[x.kind][x.sub]), safe_(x.reason), now]; });
    const all = keep.concat(add).sort(function (a, b) { const da = text_(a[0], '날짜'), db = text_(b[0], '날짜'); return da < db ? -1 : da > db ? 1 : Number(a[1]) - Number(b[1]); });
    if (v.length > 1) sh.getRange(2, 1, v.length - 1, 8).clearContent();
    if (all.length) sh.getRange(2, 1, all.length, 8).setValues(all);
    Object.keys(months).forEach(attendSheet_);
    return { ok: true, n: list.length };
  });
}
// 수식으로 읽히지 않게 (= + - @ 로 시작하면 앞에 ')
function safe_(x) { x = String(x == null ? '' : x); return /^[=+\-@]/.test(x) ? "'" + x : x; }
// 월별 출결부: 줄 = 학생, 칸 = 1~말일. 주말 · 휴일 회색, 끝에 결석 · 지각 · 조퇴 · 결과 합계
function attendSheet_(month) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), name = '출결 ' + month, days = monthDays_(month);
  let sh = ss.getSheetByName(name);
  if (!sh) { const base = sheet_('출결'); sh = ss.insertSheet(name, base ? base.getIndex() : ss.getSheets().length); sh.setTabColor('#c9636d'); }
  const recs = {};
  rows_('출결').forEach(function (r) { if (String(r['날짜']).slice(0, 7) === month) recs[Number(r['번호']) + '|' + r['날짜']] = r; });
  const n = studentCount_(), names = studentMap_(), kinds = Object.keys(ATT);
  const school = days.filter(function (d) { return !d.off && !d.hol; }).length;
  const head = ['번호', '이름'].concat(days.map(function (d) { return Number(d.d.slice(8)) + '\n' + d.wd; })).concat(kinds).concat(['출석일수']);
  const vals = [head], bg = [head.map(function (_, j) { const d = days[j - 2]; return j < 2 ? '#e9e6f5' : d ? (d.off || d.hol ? '#eceef2' : '#f6f3fb') : '#fde6ea'; })];
  for (let no = 1; no <= n; no++) {
    const row = [no, names[no] ? names[no].name : ''], rb = ['#ffffff', '#ffffff'], cnt = { '결석': 0, '지각': 0, '조퇴': 0, '결과': 0 };
    let absent = 0;
    days.forEach(function (d) {
      const r = recs[no + '|' + d.d];
      if (r) { cnt[r['종류']] = (cnt[r['종류']] || 0) + 1; if (r['종류'] === '결석' && r['구분'] !== '출석인정') absent++; }
      row.push(r ? safe_(r['기호']) : ''); rb.push(d.off || d.hol ? '#f3f4f6' : r ? ({ '결석': '#fee2e2', '지각': '#fef3c7', '조퇴': '#e0e7ff', '결과': '#dcfce7' })[r['종류']] : '#ffffff');
    });
    kinds.forEach(function (k) { row.push(cnt[k] || ''); rb.push('#fdf2f4'); });
    row.push(school - absent); rb.push('#eef7f1');
    vals.push(row); bg.push(rb);
  }
  const W = head.length, H = vals.length;
  sh.clear();
  if (sh.getMaxColumns() < W) sh.insertColumnsAfter(sh.getMaxColumns(), W - sh.getMaxColumns());
  sh.getRange(1, 1, H, W).setNumberFormat('@').setValues(vals).setBackgrounds(bg).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontFamily('Noto Sans KR').setFontSize(10)
    .setBorder(true, true, true, true, true, true, '#e5e7eb', SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(1, 1, 1, W).setFontWeight('bold').setWrap(true); sh.getRange(2, 1, H - 1, 2).setFontWeight('bold');
  sh.getRange(2, 3, H - 1, days.length).setFontSize(12).setFontWeight('bold').setFontColor('#b8323f');
  sh.setFrozenRows(1); sh.setFrozenColumns(2); sh.setRowHeight(1, 40);
  sh.setColumnWidth(1, 44); sh.setColumnWidth(2, 72); sh.setColumnWidths(3, days.length, 30); sh.setColumnWidths(3 + days.length, kinds.length + 1, 56);
  const legend = ['기호: ' + kinds.map(function (k) { return k + ' ' + Object.keys(ATT[k]).map(function (s) { return s + ATT[k][s]; }).join(' '); }).join('  |  '),
    month + ' 수업일수 ' + school + '일 (주말 · 일정 탭의 휴일 뺌) · 사유는 출결 탭에 있어요'];
  tidyTable_(sh, W, H, 28);
  sh.getRange(H + 2, 1, 2, 1).setValues(legend.map(function (x) { return [safe_(x)]; })).setFontColor('#77748c').setFontSize(9);
}

// ── 자리 배치: 교실 모양 그대로 시트에 그린다 (값 · 색을 한 번에 써서 빠르게) ─────────────
// data = { rows, cols, pair(짝 단위 칸 수), title, desks: [[{no, name, fixed, off}|{}|null ...] ...] }  (null 줄 = 모둠 사이 통로)
function saveSeats(code, pw, json) {
  guard_(code); tpw_(pw);
  const data = JSON.parse(json);
  return locked_(function () {
    setSetting_('자리 저장', String(json).slice(0, 20000));
    const sh = sheet_('자리배치');
    sh.clear(); sh.setConditionalFormatRules([]);
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();   // 지난번 병합 풀기 (병합이 겹치면 오류)
    const cols = Math.min(20, data.cols), rows = Math.min(14, data.rows), pair = Math.max(1, data.pair || 2);
    const width = cols + Math.floor((cols - 1) / pair);            // 분단 사이 통로 칸
    if (sh.getMaxColumns() < width + 1) sh.insertColumnsAfter(sh.getMaxColumns(), width + 1 - sh.getMaxColumns());
    sh.getRange(1, 1, 1, width).merge().setValue((data.title || '우리반 자리') + '  ·  ' + now_()).setFontSize(14).setFontWeight('bold').setFontColor('#46336e').setHorizontalAlignment('center');
    sh.getRange(2, 1, 1, width).merge().setValue('칠  판').setBackground('#2f4f3a').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
    sh.setRowHeight(1, 34); sh.setRowHeight(2, 30);
    const vals = [], bgs = [], desks = [];
    for (let r = 0; r < rows; r++) {
      const line = data.desks[r] || [], v = [], b = [];
      for (let k = 0; k < width; k++) { v.push(''); b.push('#ffffff'); }
      line.forEach(function (d, c) {
        if (!d || c >= cols) return;
        const col = c + Math.floor(c / pair);
        if (d.off) { b[col] = '#f3f4f6'; return; }
        v[col] = d.no ? d.no + '\n' + (d.name || '') : '빈자리';
        b[col] = d.fixed ? '#fde68a' : (Math.floor(c / pair) % 2 ? '#e0e7ff' : '#dbeafe');
        desks.push(colA1_(col + 1) + (r + 4));
      });
      vals.push(v); bgs.push(b);
      sh.setRowHeight(r + 4, line.some(function (d) { return d; }) ? 54 : 14);
    }
    if (rows) sh.getRange(4, 1, rows, width).setValues(vals).setBackgrounds(bgs).setWrap(true).setHorizontalAlignment('center').setVerticalAlignment('middle').setFontWeight('bold');
    if (desks.length) sh.getRangeList(desks).setBorder(true, true, true, true, false, false, '#94a3b8', SpreadsheetApp.BorderStyle.SOLID);
    for (let c = 1; c <= width; c++) sh.setColumnWidth(c, ((c - 1) % (pair + 1) === pair) ? 22 : 96);
    sh.getRange(rows + 5, 1, 1, width).merge().setValue('노란 칸 = 고정한 자리 · 회색 = 쓰지 않는 자리 · 웹앱 놀이 · 도구함 > 자리 뽑기에서 다시 바꿀 수 있어요')
      .setFontColor('#8a87a0').setFontSize(9);
    styleTab_(sh, '자리배치'); sh.setHiddenGridlines(true);
  });
}
// 모둠 나누기 결과
function saveGroups(code, pw, groups) {
  guard_(code); tpw_(pw);
  return locked_(function () {
    const rows = [], today = today_(), names = studentMap_();
    groups.forEach(function (g, i) { g.forEach(function (no) { rows.push([(i + 1) + '모둠', no, names[no] ? names[no].name : '', today]); }); });
    writeTable_('모둠', rows, true);
  });
}

// ── 제작자에게 메시지 (기능 요청 · 오류 알림). 제작자 시트의 '요청함'에 한 줄씩 쌓인다 ─────────────
function sendFeedback(code, pw, cat, text, contact) {
  guard_(code); tpw_(pw);
  if (!FEEDBACK_URL) throw new Error('제작자 요청함이 아직 연결되지 않았어요.');
  text = String(text || '').trim().slice(0, 2000);
  if (text.length < 4) throw new Error('내용을 조금 더 자세히 적어 주세요.');
  const cache = CacheService.getScriptCache(), cnt = Number(cache.get('fb') || 0);
  if (cnt >= 5) throw new Error('잠시 뒤에 다시 보내 주세요. (10분에 5번까지)');
  cache.put('fb', String(cnt + 1), 600);
  const res = UrlFetchApp.fetch(FEEDBACK_URL, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ cat: String(cat || '기타').slice(0, 10), text: text, contact: String(contact || '').slice(0, 80),
      nick: String(settings_()['학급 닉네임'] || '').slice(0, 30), version: VERSION }) });
  if (res.getResponseCode() >= 400) throw new Error('보내지 못했어요. 잠시 뒤에 다시 해 주세요.');
  return { ok: true };
}

// ── 날씨 · 미세먼지: Open-Meteo (키 필요 없음), 15분마다 새로 ─────────────────────
function getWeather(code) {
  guard_(code);
  const cache = CacheService.getScriptCache(), hit = cache.get('weather');
  if (hit) return JSON.parse(hit);
  const s = settings_(), lat = encodeURIComponent(s['위도'] || '35.20'), lon = encodeURIComponent(s['경도'] || '128.57');
  const out = { place: s['날씨 지역'] || '' };
  try {
    const j = JSON.parse(UrlFetchApp.fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,weather_code,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul',
      { muteHttpExceptions: true }).getContentText());
    const c = j.current.weather_code;
    out.temp = Math.round(j.current.temperature_2m); out.feels = Math.round(j.current.apparent_temperature); out.hum = j.current.relative_humidity_2m;
    out.max = Math.round(j.daily.temperature_2m_max[0]); out.min = Math.round(j.daily.temperature_2m_min[0]);
    out.rain = j.daily.precipitation_probability_max ? j.daily.precipitation_probability_max[0] : null;
    out.text = c === 0 ? '맑음' : c <= 3 ? '구름' : c <= 48 ? '안개' : c <= 67 ? '비' : c <= 77 ? '눈' : c <= 82 ? '소나기' : '뇌우';
  } catch (e) {}
  try {
    const a = JSON.parse(UrlFetchApp.fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + lat + '&longitude=' + lon +
      '&current=pm10,pm2_5&timezone=Asia%2FSeoul', { muteHttpExceptions: true }).getContentText());
    out.pm10 = Math.round(a.current.pm10); out.pm25 = Math.round(a.current.pm2_5);
  } catch (e) {}
  if (out.temp === undefined && out.pm10 === undefined) return null;
  cache.put('weather', JSON.stringify(out), 900);
  return out;
}

// ── 오늘 급식: 나이스 교육정보 개방 포털 공개 자료 (학교 코드 · 날짜만 보낸다. 키 없이는 한 번에 5건 → 한 주 점심만 받는다) ─────────
const NEIS = 'https://open.neis.go.kr/hub/';
function schoolUrl_(name, office) {
  return NEIS + 'schoolInfo?Type=json&pSize=5&SCHUL_NM=' + encodeURIComponent(String(name).trim()) + (office ? '&ATPT_OFCDC_SC_CODE=' + encodeURIComponent(office) : '');
}
function parseSchools_(j) {
  const box = j && j.schoolInfo;
  if (!box) return { total: 0, list: [] };
  const total = Number((((box[0] || {}).head || [])[0] || {}).list_total_count) || 0;
  const list = ((box[1] || {}).row || []).map(function (r) {
    return { office: r.ATPT_OFCDC_SC_CODE, officeName: r.ATPT_OFCDC_SC_NM, code: r.SD_SCHUL_CODE, name: r.SCHUL_NM, kind: r.SCHUL_KND_SC_NM, found: r.FOND_SC_NM, addr: r.ORG_RDNMA || '' };
  });
  return { total: total, list: list };
}
function mondayOf_(ymd) { const d = new Date(ymd + 'T12:00:00'), wd = d.getDay(); return addDays_(ymd, -(wd === 0 ? 6 : wd - 1)); }
function mealUrl_(codes, mon) {
  const p = String(codes).split('|');
  return NEIS + 'mealServiceDietInfo?Type=json&pSize=5&MMEAL_SC_CODE=2&ATPT_OFCDC_SC_CODE=' + encodeURIComponent(p[0]) + '&SD_SCHUL_CODE=' + encodeURIComponent(p[1]) +
    '&MLSV_FROM_YMD=' + mon.replace(/-/g, '') + '&MLSV_TO_YMD=' + addDays_(mon, 4).replace(/-/g, '');
}
// '참치김치찌개 (5.8.9.18)' → { n: '참치김치찌개', a: [5, 8, 9, 18] }  (알레르기 유발 식품 번호 1~19)
function dish_(x) {
  let s = String(x).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim(), a = [];
  const m = /\s*\(?((?:\d{1,2}\.)*\d{1,2})\.?\)?\s*$/.exec(s);
  if (m && /[(.]/.test(m[0])) { a = m[1].split('.').map(Number).filter(function (n) { return n >= 1 && n <= 19; }); s = s.slice(0, m.index).trim(); }
  return { n: s.replace(/[*#@]+$/, '').trim(), a: a };
}
function parseMeals_(j) {
  const box = j && j.mealServiceDietInfo, out = {}, lines = function (v) { return String(v || '').split(/<br\s*\/?>/i).map(function (x) { return x.trim(); }).filter(String); };
  if (!box) return out;
  ((box[1] || {}).row || []).forEach(function (r) {
    const ymd = String(r.MLSV_YMD).replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
    out[ymd] = { dishes: lines(r.DDISH_NM).map(dish_).filter(function (d) { return d.n; }), cal: String(r.CAL_INFO || '').replace(/\s*kcal/i, '').trim(),
      ntr: lines(r.NTR_INFO), origin: lines(r.ORPLC_INFO).filter(function (x) { return !/:\s*$/.test(x); }) };
  });
  return out;
}
function mealSchool_() { const s = settings_(); return { codes: String(s['급식 학교 코드'] || '').trim(), name: String(s['급식 학교'] || '') }; }
function getMeal(code, ymd) {
  guard_(code);
  const sc = mealSchool_();
  if (!/^[A-Z]\d{2}\|\d{5,10}$/.test(sc.codes)) return { none: true };
  ymd = /^\d{4}-\d{2}-\d{2}$/.test(String(ymd)) ? String(ymd) : today_();
  const mon = mondayOf_(ymd), key = 'meal-' + sc.codes + '-' + mon, cache = CacheService.getScriptCache(), hit = cache.get(key);
  let days = hit ? JSON.parse(hit) : null;
  if (!days) {
    try { days = parseMeals_(JSON.parse(UrlFetchApp.fetch(mealUrl_(sc.codes, mon), { muteHttpExceptions: true }).getContentText())); }
    catch (e) { return { school: sc.name, monday: mon, error: true }; }
    cache.put(key, JSON.stringify(days), 3 * 3600);
  }
  return { school: sc.name, monday: mon, days: days };
}
function searchSchool(code, pw, name, office) {
  guard_(code); tpw_(pw);
  if (String(name || '').trim().length < 2) throw new Error('학교 이름을 두 글자 이상 적어 주세요.');
  return parseSchools_(JSON.parse(UrlFetchApp.fetch(schoolUrl_(name, office), { muteHttpExceptions: true }).getContentText()));
}
function saveSchool(code, pw, office, sc, name) {
  guard_(code); tpw_(pw);
  if (!/^[A-Z]\d{2}$/.test(String(office)) || !/^\d{5,10}$/.test(String(sc))) throw new Error('학교를 다시 골라 주세요.');
  return locked_(function () { setSetting_('급식 학교', String(name || '').slice(0, 40)); setSetting_('급식 학교 코드', office + '|' + sc); return { ok: true }; });
}

// ── 주방 안쪽 도구 ──────────────────────────────────────────────
function guard_(code) {
  _set = null;
  const secret = String(settings_()['화면 잠금 코드'] || '').trim();
  if (secret && String(code || '').trim() !== secret) throw new Error('화면 잠금 코드가 맞지 않아요.');
}
function tpw_(pw) { if (String(pw || '').trim() !== String(settings_()['선생님 비밀번호'] || '1234').trim()) throw new Error('선생님 비밀번호가 맞지 않아요.'); }
function locked_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let out;
  try { out = fn(); } finally { lock.releaseLock(); }
  return out || { ok: true };
}
function sheet_(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function rows_(name) {
  const sh = sheet_(name);
  if (!sh || !TABS[name]) return [];
  const v = sh.getDataRange().getValues(), head = v.shift();
  if (!head) return [];
  return v.map(function (r, i) { const o = { _row: i + 2 }; head.forEach(function (h, j) { o[h] = text_(r[j], h); }); return o; })
    .filter(function (o) { return head.some(function (h) { return o[h] !== ''; }); });
}
// 맨 아래 n줄만 읽는다 (기록이 1년 치 쌓여도 빠르게)
function tail_(name, n) {
  const sh = sheet_(name);
  if (!sh) return [];
  const last = sh.getLastRow();
  if (last < 2) return [];
  const head = sh.getRange(1, 1, 1, TABS[name] ? TABS[name].length : sh.getLastColumn()).getValues()[0];
  const start = Math.max(2, last - n + 1);
  return sh.getRange(start, 1, last - start + 1, head.length).getValues().map(function (r, i) {
    const o = { _row: start + i }; head.forEach(function (h, j) { o[h] = text_(r[j], h); }); return o;
  }).filter(function (o) { return head.some(function (h) { return o[h] !== ''; }); });
}
let _set = null;
function settings_() {
  if (_set) return _set;
  const o = {};
  rows_('설정').forEach(function (r) { if (r['항목']) o[String(r['항목']).trim()] = r['값']; });
  return (_set = o);
}
function setSetting_(key, value) {
  const sh = sheet_('설정'), v = sh.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]).trim() === key) { sh.getRange(i + 1, 2, 1, 1).setValues([[value]]); _set = null; return; }
  sh.appendRow([key, value, '']);
  _set = null;
}
function mainColor_() { const c = String(settings_()['대표 색'] || '').trim(); return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#7566c0'; }
function list_(key, def) { return String(settings_()[key] || def).split(',').map(function (x) { return x.trim(); }).filter(String); }
function studentCount_() { return Math.max(1, Math.min(40, Number(settings_()['학생 수']) || 25)); }
function sex_(v) { v = String(v || '').trim().toLowerCase(); return /^(남|m|boy|b)/.test(v) ? '남' : /^(여|f|girl|g|w)/.test(v) ? '여' : ''; }
function studentMap_() {
  const m = {};
  rows_('학생').forEach(function (r) { if (r['사용'] !== '아니오' && Number(r['번호'])) m[Number(r['번호'])] = { name: r['이름'], role: r['1인 1역'], bday: r['생일'] || '', sex: sex_(r['성별']) }; });
  return m;
}
// '3/5', '03-05', '2014-03-05', '3월 5일' → '03-05'
function mmdd_(v) { const m = String(v || '').match(/(\d{1,2})\D+(\d{1,2})\D*$/); return m ? ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2) : ''; }
function checkNo_(no) { no = Number(no); if (!(no >= 1 && no <= studentCount_())) throw new Error('없는 번호예요: ' + no); return no; }
function nextNo_(name) { let max = 0; rows_(name).forEach(function (r) { max = Math.max(max, Number(r['번호']) || 0); }); return max + 1; }
function findRow_(sh, no) {
  const v = sh.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(no)) return i + 1;
  throw new Error('그 항목을 시트에서 찾지 못했어요. 새로고침해 보세요.');
}
function text_(v, head) {
  if (v instanceof Date) {
    const tz = Session.getScriptTimeZone();
    if (head === '시각') return Utilities.formatDate(v, tz, v.getFullYear() <= 1900 ? 'HH:mm' : 'yyyy-MM-dd HH:mm');   // 시각만 적힌 칸은 1899년 날짜로 읽힌다
    return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  }
  return v === null || v === undefined ? '' : String(v);
}
function weekday_(ymd) { return ['일', '월', '화', '수', '목', '금', '토'][new Date(ymd + 'T12:00:00').getDay()]; }
function today_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function now_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); }
function addDays_(ymd, n) { const d = new Date(ymd + 'T12:00:00'); d.setDate(d.getDate() + n); return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd'); }

// ── 학급 온도계 자동 규칙 · 보상 단계 ───────────────────────
// 보상: '25:간식 보상,50:자유 체육 시간' → [{at:25, name:'간식 보상'}, ...] (온도 순)
function thermoRewards_() {
  return String(settings_()['온도계 보상'] || '').split(',').map(function (x) { const m = /^\s*(\d{1,3})\s*[:：]\s*(.+?)\s*$/.exec(x); return m ? { at: Number(m[1]), name: m[2].slice(0, 30) } : null; })
    .filter(function (x) { return x && x.at > 0; }).sort(function (a, b) { return a.at - b.at; });
}
function thermoRules_() {
  const s = settings_(), num = function (k, d) { const v = Number(s[k]); return isNaN(v) || String(s[k]).trim() === '' ? d : v; };
  return { noName: Math.max(0, Math.min(50, num(s['온도계 수업방해 없는 날'] != null && String(s['온도계 수업방해 없는 날']).trim() !== '' ? '온도계 수업방해 없는 날' : '온도계 이름 없는 날', 5))), cut: /^\d{1,2}:\d{2}$/.test(String(s['온도계 하루 정산 시각'] || '').trim()) ? String(s['온도계 하루 정산 시각']).trim() : '14:30',
    rolePct: Math.max(1, Math.min(100, num('온도계 1인1역 기준', 80))), role: Math.max(0, Math.min(50, num('온도계 1인1역 온도', 5))) };
}
// 수업한 날 = 그날 번호판 기록(우유 · 다 했어요 · 1인 1역 · 발표 · 이름)이 하나라도 있는 평일
function dayLog_() {
  const by = {};
  tail_('기록', 6000).forEach(function (r) { const d = String(r['날짜']); if (!d) return; const o = by[d] || (by[d] = { any: 0, name: 0, role: {} }); o.any++; if (r['종류'] === '수업방해' || r['종류'] === '이름') o.name++; if (r['종류'] === '1인1역') o.role[Number(r['번호'])] = 1; });
  return by;
}
// 한 주 1인 1역 비율: (수업한 날마다 역할 다 한 학생 수 합) ÷ (학생 수 × 수업한 날 수)
function roleWeek_(monday, upto, withToday, log) {
  log = log || dayLog_();
  const n = Object.keys(studentMap_()).length || studentCount_();
  let days = 0, hit = 0;
  for (let i = 0; i < 5; i++) {
    const d = addDays_(monday, i); if (d > upto || (!withToday && d === upto)) break;
    const o = log[d]; if (!o || !o.any) continue;
    days++; hit += Object.keys(o.role).length;
  }
  return { monday: monday, days: days, pct: days ? Math.round(hit / (n * days) * 100) : 0, need: thermoRules_().rolePct };
}
function thermoAdd_(delta, why) {
  const th = tail_('온도계', 1), total = Math.max(0, (th.length ? Number(th[0]['누적']) || 0 : 0) + delta);
  sheet_('온도계').appendRow([now_(), today_(), delta, why.slice(0, 40), total]);
  return total;
}
// 자동 규칙 정산 (바탕화면이 열려 있을 때 몇 분마다 부른다). 같은 날 · 같은 주는 한 번만
function thermoAuto(code) {
  guard_(code);
  return locked_(function () {
    const R = thermoRules_(), today = today_(), out = [];
    let start = String(settings_()['온도계 자동 시작일'] || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) { setSetting_('온도계 자동 시작일', today); start = today; }   // 켠 날부터만 (지난 기록으로 한꺼번에 오르지 않게)
    const log = dayLog_(), done = {};
    rows_('온도계').forEach(function (r) { const w = String(r['이유'] || '').replace(/ 취소$/, '').replace(/^이름 없는 날/, '수업방해 없는 날'); done[w] = (done[w] || 0) + (Number(r['변화']) || 0); });   // 이유별 순변화 (취소 포함)
    const now = now_().slice(11, 16);
    // 수업방해 없는 날: 시작일 ~ 오늘(정산 시각이 지났으면 오늘까지)
    if (R.noName > 0) {
      for (let d = start; d <= today; d = addDays_(d, 1)) {
        const wd = new Date(d + 'T12:00:00').getDay(); if (wd === 0 || wd === 6) continue;
        if (d === today && now < R.cut) continue;
        const o = log[d]; if (!o || !o.any || o.name) continue;
        const why = '수업방해 없는 날 (' + d.slice(5).replace('-', '/') + ')';
        if ((done[why] || 0) > 0 || (done[why] === 0 && o.name)) continue;
        thermoAdd_(R.noName, why); done[why] = 1; out.push({ d: R.noName, why: why });
      }
    }
    // 1인 1역 주간: 끝난 주(금요일이 지났거나 오늘이 금요일 정산 시각 뒤)
    if (R.role > 0) {
      for (let m = mondayOf_(start); m <= mondayOf_(today); m = addDays_(m, 7)) {
        const fri = addDays_(m, 4), over = fri < today || (fri === today && now >= R.cut); if (!over) continue;
        const w = roleWeek_(m < start ? m : m, fri, true, log); if (!w.days || w.pct < R.rolePct) continue;
        const why = '1인 1역 ' + w.pct + '% 주간 (' + m.slice(5).replace('-', '/') + '~)';
        const key = '1인 1역 주간 (' + m.slice(5).replace('-', '/') + '~)';
        if (Object.keys(done).some(function (k) { return k.indexOf('1인 1역 ') === 0 && k.indexOf('주간 (' + m.slice(5).replace('-', '/') + '~)') > 0 && done[k] > 0; })) continue;
        thermoAdd_(R.role, why); done[key] = 1; out.push({ d: R.role, why: why });
      }
    }
    return { added: out };
  });
}
// 번호판 '수업방해' (선생님만). 정산 시각 뒤 이미 올랐는데 선택하면 그만큼 되돌린다
function isDisrupt_(r) { return r['종류'] === '수업방해' || r['종류'] === '이름'; }
function disruptActive_(r) { return isDisrupt_(r) && String(r['내용'] || '').indexOf('해제') < 0; }
// 번호판 '수업방해' (선생님만). 선택은 기록을 남기고, 다시 누르면 화면에서만 빠진다(기록에 '해제'만 붙임).
// 정산 시각 뒤에 새로 선택하면 그날 오른 온도를 되돌린다
function nameMark(code, pw, no, label) {
  guard_(code); tpw_(pw); no = checkNo_(no);
  return locked_(function () {
    const st = studentMap_()[no] || { name: '' }, today = today_();
    const hit = tail_('기록', 1500).reverse().filter(function (r) { return r['날짜'] === today && Number(r['번호']) === no && disruptActive_(r); })[0];
    if (hit) { sheet_('기록').getRange(hit._row, 6, 1, 1).setValues([[String(hit['내용'] || '').trim() + (hit['내용'] ? ' · ' : '') + '해제 ' + now_().slice(11, 16)]]); return { ok: true, on: false }; }
    sheet_('기록').appendRow([now_(), today, '수업방해', no, st.name, String(label || '').slice(0, 20)]);
    const md = today.slice(5).replace('-', '/'), why = '수업방해 없는 날 (' + md + ')';
    let net = 0; rows_('온도계').forEach(function (r) { const w = String(r['이유'] || '').replace(/ 취소$/, '').replace(/^이름 없는 날/, '수업방해 없는 날'); if (w === why) net += Number(r['변화']) || 0; });
    if (net > 0) thermoAdd_(-net, why + ' 취소');
    return { ok: true, on: true, undone: net > 0 ? net : 0 };
  });
}
// 교시 끝: 지금 선택된 친구를 모두 화면에서 뺀다 (기록은 그대로)
function nameReset(code, pw) {
  guard_(code); tpw_(pw);
  return locked_(function () {
    const today = today_(), t = now_().slice(11, 16); let n = 0;
    tail_('기록', 1500).forEach(function (r) { if (r['날짜'] === today && disruptActive_(r)) { sheet_('기록').getRange(r._row, 6, 1, 1).setValues([[String(r['내용'] || '').trim() + (r['내용'] ? ' · ' : '') + '해제 ' + t]]); n++; } });
    return { ok: true, n: n };
  });
}
// 그날 수업방해 기록 (서랍에서 보기 · 실수 지우기)
function nameList(code, pw, ymd) {
  guard_(code); tpw_(pw); ymd = /^\d{4}-\d{2}-\d{2}$/.test(String(ymd)) ? ymd : today_();
  return { d: ymd, list: tail_('기록', 3000).filter(function (r) { return r['날짜'] === ymd && isDisrupt_(r); })
    .map(function (r) { return { t: String(r['시각']).slice(11, 16), at: r['시각'], no: Number(r['번호']), name: r['이름'], label: String(r['내용'] || '').replace(/\s*·?\s*해제.*$/, ''), off: String(r['내용'] || '').indexOf('해제') >= 0 }; }) };
}
// 실수로 누른 기록 지우기 (시각 + 번호로 찾음)
function nameDel(code, pw, at, no) {
  guard_(code); tpw_(pw);
  return locked_(function () {
    const hit = tail_('기록', 3000).reverse().filter(function (r) { return isDisrupt_(r) && String(r['시각']) === String(at) && Number(r['번호']) === Number(no); })[0];
    if (hit) sheet_('기록').deleteRow(hit._row);
    return { ok: !!hit };
  });
}
// 서랍 > 온도계: 규칙과 보상을 한 번에 저장
function thermoRulesSave(code, pw, o) {
  guard_(code); tpw_(pw); o = o || {};
  const rw = (o.rewards || []).map(function (x) { return { at: Math.round(Number(x.at)), name: String(x.name || '').replace(/[,:：]/g, ' ').trim().slice(0, 30) }; })
    .filter(function (x) { return x.at >= 1 && x.at <= 999 && x.name; }).sort(function (a, b) { return a.at - b.at; });
  if (!rw.length) throw new Error('보상을 한 개 이상 적어 주세요.');
  const cut = String(o.cut || '14:30').trim(); if (!/^\d{1,2}:\d{2}$/.test(cut)) throw new Error('정산 시각은 14:30처럼 적어 주세요.');
  return locked_(function () {
    setSetting_('온도계 보상', rw.map(function (x) { return x.at + ':' + x.name; }).join(','));
    setSetting_('온도계 목표', String(rw[rw.length - 1].at));
    setSetting_('온도계 수업방해 없는 날', String(Math.max(0, Math.min(50, Math.round(Number(o.noName) || 0)))));
    setSetting_('온도계 하루 정산 시각', cut.length === 4 ? '0' + cut : cut);
    setSetting_('온도계 1인1역 기준', String(Math.max(1, Math.min(100, Math.round(Number(o.rolePct) || 80)))));
    setSetting_('온도계 1인1역 온도', String(Math.max(0, Math.min(50, Math.round(Number(o.role) || 0)))));
    return { ok: true, rewards: rw };
  });
}

// ── 알림장 (날짜마다 한 줄. 칠판 카드에는 오늘 것만) ─────────────────────
function noticeSheet_() {
  let sh = sheet_('알림장');
  if (!sh) { sh = SpreadsheetApp.getActiveSpreadsheet().insertSheet('알림장'); sh.appendRow(TABS['알림장']); try { decorate_(sh, '알림장'); } catch (e) {} }
  return sh;
}
function noticeRows_() { if (!sheet_('알림장')) return []; return rows_('알림장'); }
function noticeOf_(ymd) { const r = noticeRows_().filter(function (x) { return x['날짜'] === ymd && x['내용']; })[0]; return r ? { d: r['날짜'], text: r['내용'] } : null; }
// 한 달 치 (yyyy-MM) — 서랍에서 지난 알림장 보기
function noticeList(code, pw, month) {
  guard_(code); tpw_(pw);
  month = /^\d{4}-\d{2}$/.test(String(month)) ? String(month) : today_().slice(0, 7);
  const list = noticeRows_().filter(function (r) { return String(r['날짜']).slice(0, 7) === month && r['내용']; })
    .map(function (r) { return { d: r['날짜'], text: r['내용'], at: r['고친 시각'] || '' }; });
  list.sort(function (a, b) { return a.d < b.d ? 1 : -1; });
  return { month: month, list: list };
}
// 저장 (내용을 비우면 그날 알림장을 지운다)
function noticeSave(code, pw, ymd, text) {
  guard_(code); tpw_(pw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd))) throw new Error('날짜를 골라 주세요.');
  text = String(text || '').replace(/\r/g, '').split('\n').map(function (x) { return x.trim(); }).filter(String).join('\n').slice(0, 1500);
  return locked_(function () {
    const sh = noticeSheet_(), hit = rows_('알림장').filter(function (r) { return r['날짜'] === ymd; })[0];
    if (!text) { if (hit) sh.deleteRow(hit._row); return { ok: true, del: true }; }
    const row = [ymd, text, now_()];
    if (hit) sh.getRange(hit._row, 1, 1, 3).setValues([row]); else sh.appendRow(row);
    return { ok: true, at: row[2] };
  });
}

// ── 수업계획 (선생님 서랍에서만. 날짜 + 교시마다 한 줄) ─────────────────────
const LESSON_KEYS = ['과목', '단원 · 차시', '학습 목표', '수업 계획', '활동 계획', '준비물', '메모'];
function lessonSheet_() {
  let sh = sheet_('수업계획');
  if (!sh) { sh = SpreadsheetApp.getActiveSpreadsheet().insertSheet('수업계획'); sh.appendRow(TABS['수업계획']); try { decorate_(sh, '수업계획'); } catch (e) {} }
  return sh;
}
function lessonRows_() { lessonSheet_(); return rows_('수업계획'); }
function lessonOut_(r) { const o = { d: r['날짜'], n: Number(r['교시']) || 0, at: r['고친 시각'] || '' }; LESSON_KEYS.forEach(function (k) { o[k] = r[k] || ''; }); return o; }
// 한 주(월~금): 그날 실제 시간표(바뀐 시간표 포함) + 적어 둔 수업계획
function lessonWeek(code, pw, monday) {
  guard_(code); tpw_(pw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(monday))) monday = mondayOf_(today_());
  const days = [0, 1, 2, 3, 4].map(function (i) { const ymd = addDays_(monday, i), t = timetable_(ymd); return { ymd: ymd, wd: weekday_(ymd), periods: t.periods, changed: t.changed }; });
  const last = addDays_(monday, 4);
  const plans = lessonRows_().filter(function (r) { return r['날짜'] >= monday && r['날짜'] <= last; }).map(lessonOut_);
  return { monday: monday, days: days, plans: plans, count: Math.max(6, timetable_(monday).count || 0) };
}
// 찾기: 과목 · 단원 · 목표 · 계획 · 활동 · 메모에 낱말이 들어간 수업 (최근 것부터 60개)
function lessonFind(code, pw, q) {
  guard_(code); tpw_(pw);
  q = String(q || '').trim().toLowerCase();
  const all = lessonRows_().map(lessonOut_).filter(function (o) { return !q || LESSON_KEYS.some(function (k) { return String(o[k]).toLowerCase().indexOf(q) >= 0; }); });
  all.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : b.n - a.n; });
  return { q: q, total: all.length, list: all.slice(0, 60) };
}
function lessonSave(code, pw, ymd, n, data) {
  guard_(code); tpw_(pw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd))) throw new Error('날짜를 골라 주세요.');
  n = Number(n); if (!(n >= 1 && n <= 9)) throw new Error('교시를 골라 주세요.');
  data = data || {};
  const lim = { '과목': 20, '단원 · 차시': 80, '학습 목표': 300, '수업 계획': 3000, '활동 계획': 3000, '준비물': 300, '메모': 1000 };
  const vals = LESSON_KEYS.map(function (k) { return String(data[k] == null ? '' : data[k]).trim().slice(0, lim[k]); });
  if (!vals.slice(1).some(String)) throw new Error('단원 · 목표 · 계획 중 하나는 적어 주세요.');
  return locked_(function () {
    const sh = lessonSheet_(), hit = lessonRows_().filter(function (r) { return r['날짜'] === ymd && Number(r['교시']) === n; })[0];
    const row = [ymd, n].concat(vals).concat([now_()]);
    if (hit) sh.getRange(hit._row, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
    return { ok: true, at: row[row.length - 1] };
  });
}
function lessonDel(code, pw, ymd, n) {
  guard_(code); tpw_(pw);
  return locked_(function () {
    const hit = lessonRows_().filter(function (r) { return r['날짜'] === ymd && Number(r['교시']) === Number(n); })[0];
    if (hit) lessonSheet_().deleteRow(hit._row);
  });
}

// ── 앱판에서만 다른 부분 (Code.gs 바로 뒤에 붙어 같은 이름을 덮어쓴다) ─────────────
// 인터넷에서 가져오는 일(날씨 · 지역 찾기 · 제작자에게)은 브라우저에서 기다려야 해서 async 로 바꾼다.
// 학생 정보는 이 브라우저와 선생님 구글 시트 사이에서만 오간다. 제작자 서버에 모으지 않는다.

// 체크표 · 학생별 · 날짜별은 저장 직전에 한 번만 다시 그린다 (bridge.js) → sync 는 읽기만
function sync(code) { guard_(code); return getAll(code); }

async function geocode_(name) {
  const parts = String(name).trim().split(/\s+/).filter(String);
  const stem = function (x) { return String(x).replace(/(특별자치시|특별자치도|특별시|광역시|도|시|구|군)$/, ''); };
  for (let i = parts.length - 1; i >= 0; i--) {
    const hints = parts.slice(0, i).map(stem).filter(String);
    try {
      const j = await (await fetch('https://geocoding-api.open-meteo.com/v1/search?count=30&language=ko&name=' + encodeURIComponent(parts[i]))).json();
      const kr = (j.results || []).filter(function (r) { return r.country_code === 'KR'; });
      const hit = kr.filter(function (r) { const where = [r.admin1, r.admin2, r.admin3, r.admin4].join(' ');
        return hints.every(function (h) { return where.indexOf(h) >= 0; }); })[0] || (hints.length ? null : kr[0]);
      if (hit) return { lat: Math.round(hit.latitude * 100) / 100, lon: Math.round(hit.longitude * 100) / 100, name: hit.name };
    } catch (e) {}
  }
  return null;
}
async function saveSetting(code, pw, key, value) {
  guard_(code); tpw_(pw);
  if (SETTABLE.indexOf(key) < 0) throw new Error('여기서는 바꿀 수 없는 항목이에요: ' + key);
  value = String(value == null ? '' : value).trim().slice(0, 300);
  if (key === '학생 수' && !(Number(value) >= 1 && Number(value) <= 40)) throw new Error('학생 수는 1 ~ 40명이에요.');
  if (key === '지금 활동' && !value) throw new Error('활동 이름을 적어 주세요.');
  let place = null;
  if (key === '날씨 지역') { place = await geocode_(value); if (!place) throw new Error("'" + value + "' 지역을 찾지 못했어요. 시 · 구 · 동 이름으로 다시 적어 보세요."); }
  setSetting_(key, value);
  if (place) { setSetting_('위도', String(place.lat)); setSetting_('경도', String(place.lon)); CacheService.getScriptCache().remove('weather'); }
  if (key === '계정 종류' || key === '학생 수') syncTabs_(true);
  return { ok: true, place: place };
}
async function getWeather(code) {
  guard_(code);
  const cache = CacheService.getScriptCache(), hit = cache.get('weather');
  if (hit) return JSON.parse(hit);
  const s = settings_(), lat = encodeURIComponent(s['위도'] || '35.20'), lon = encodeURIComponent(s['경도'] || '128.57');
  const out = { place: s['날씨 지역'] || '' };
  try {
    const j = await (await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,weather_code,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul')).json();
    const c = j.current.weather_code;
    out.temp = Math.round(j.current.temperature_2m); out.feels = Math.round(j.current.apparent_temperature); out.hum = j.current.relative_humidity_2m;
    out.max = Math.round(j.daily.temperature_2m_max[0]); out.min = Math.round(j.daily.temperature_2m_min[0]);
    out.rain = j.daily.precipitation_probability_max ? j.daily.precipitation_probability_max[0] : null;
    out.text = c === 0 ? '맑음' : c <= 3 ? '구름' : c <= 48 ? '안개' : c <= 67 ? '비' : c <= 77 ? '눈' : c <= 82 ? '소나기' : '뇌우';
  } catch (e) {}
  try {
    const a = await (await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + lat + '&longitude=' + lon + '&current=pm10,pm2_5&timezone=Asia%2FSeoul')).json();
    out.pm10 = Math.round(a.current.pm10); out.pm25 = Math.round(a.current.pm2_5);
  } catch (e) {}
  if (out.temp === undefined && out.pm10 === undefined) return null;
  cache.put('weather', JSON.stringify(out), 900);
  return out;
}
async function sendFeedback(code, pw, cat, text, contact) {
  guard_(code); tpw_(pw);
  text = String(text || '').trim().slice(0, 2000);
  if (text.length < 4) throw new Error('내용을 조금 더 자세히 적어 주세요.');
  const cache = CacheService.getScriptCache(), cnt = Number(cache.get('fb') || 0);
  if (cnt >= 5) throw new Error('잠시 뒤에 다시 보내 주세요. (10분에 5번까지)');
  cache.put('fb', String(cnt + 1), 600);
  // text/plain 이면 브라우저가 미리 묻지(preflight) 않고 바로 보낸다. 요청함은 본문을 JSON 으로 읽는다
  await fetch(FEEDBACK_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ app: '우리반 바탕화면', cat: String(cat || '기타').slice(0, 10), text: text, contact: String(contact || '').slice(0, 80),
      nick: String(settings_()['학급 닉네임'] || '').slice(0, 30), version: VERSION + ' (앱판)' }) });
  return { ok: true };
}

// 시트 관리 단추에서: 확인은 앱 화면에서 이미 받았다
function sheetTool(code, pw, name) {
  guard_(code); tpw_(pw);
  const fns = { resetAll: resetAll, removeSamples: removeSamples, clearRecords: clearRecords, applySettings: applySettings, refreshAll: refreshAll,
    monthReport: monthReport, sortStudents: sortStudents, sortNotes: sortNotes, sortEvents: sortEvents, toggleRaw: toggleRaw, restyle: restyle };
  if (!fns[name]) throw new Error('알 수 없는 시트 관리 단추예요: ' + name);
  fns[name]();
  return { ok: true, raw: sheet_('기록') ? !sheet_('기록').isSheetHidden() : false };
}

// 시트 공유 확인: 링크 공유(누구나 · 학교 전체)와 사람 단위 공유를 모두 본다 (Drive API — 이 앱이 만든 시트라 drive.file 권한으로 읽힌다)
async function shareInfo(code, pw) {
  guard_(code); tpw_(pw);
  if (!GS.hasBackend()) return { known: true, link: '', people: [], demo: true };
  const id = GS.info().id;
  const f = await DESK.drive('/' + id + '?fields=owners(emailAddress),permissions(type,role,emailAddress,domain)&supportsAllDrives=true');
  const owner = ((f.owners || [])[0] || {}).emailAddress || '';
  let link = '', people = [];
  (f.permissions || []).forEach(function (p) {
    if (p.type === 'anyone') link = '링크가 있는 누구나';
    else if (p.type === 'domain') link = (p.domain || '학교') + ' 전체';
    else if (p.emailAddress && p.emailAddress !== owner && people.indexOf(p.emailAddress) < 0) people.push(p.emailAddress);
  });
  return { known: true, link: link, people: people, owner: maskMail_(owner) };
}
// 비밀번호를 잊었을 때: 이 시트 주인(구글 계정) 메일로만 보낸다. 받는 곳은 Drive 가 알려 주는 시트 주인 — 누르는 사람이 고를 수 없다.
// 앱판은 선생님 구글 계정으로 메일을 보낼 권한을 받지 않으므로(drive.file 하나만), 제작자 요청함 스크립트가 정해진 글로 대신 보낸다. 저장하지 않는다.
async function mailPw(code) {
  guard_(code);
  if (!GS.hasBackend()) throw new Error('체험판에서는 메일을 보내지 않아요. 체험판 비밀번호는 1234예요.');
  const cache = CacheService.getScriptCache(), n = Number(cache.get('pwmail') || 0);
  if (n >= 3) throw new Error('메일은 한 시간에 세 번까지 보낼 수 있어요. 받은편지함과 스팸함을 먼저 확인해 주세요.');
  const f = await DESK.drive('/' + GS.info().id + '?fields=owners(emailAddress)&supportsAllDrives=true');
  const to = ((f.owners || [])[0] || {}).emailAddress;
  if (!to) throw new Error('시트 주인 메일을 알 수 없어요. 구글 시트 > 설정 탭의 선생님 비밀번호 칸을 확인해 주세요.');
  let ready = null;
  try { ready = await (await fetch(FEEDBACK_URL + '?pw=1')).json(); } catch (e) {}
  if (!ready || ready.pwmail !== true) throw new Error('메일 보내기를 준비하는 중이에요. 지금은 구글 시트 > 설정 탭의 선생님 비밀번호 칸에서 확인해 주세요.');
  cache.put('pwmail', String(n + 1), 3600);
  const s = settings_();
  const r = await (await fetch(FEEDBACK_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ type: 'pwmail', to: to, pw: String(s['선생님 비밀번호'] || '1234').slice(0, 20), nick: String(s['학급 닉네임'] || '우리반').slice(0, 30),
      sheet: SpreadsheetApp.getActiveSpreadsheet().getUrl() }) })).json();
  if (!r || !r.ok) throw new Error((r && r.error) || '보내지 못했어요. 잠시 뒤에 다시 해 주세요.');
  return { ok: true, to: maskMail_(to) };
}

// 오늘 급식 · 학교 찾기: 나이스 공개 자료를 브라우저에서 바로 (학교 코드 · 날짜만 보냄)
async function getMeal(code, ymd) {
  guard_(code);
  const sc = mealSchool_();
  if (!/^[A-Z]\d{2}\|\d{5,10}$/.test(sc.codes)) return { none: true };
  ymd = /^\d{4}-\d{2}-\d{2}$/.test(String(ymd)) ? String(ymd) : today_();
  const mon = mondayOf_(ymd), key = 'meal-' + sc.codes + '-' + mon, cache = CacheService.getScriptCache(), hit = cache.get(key);
  let days = hit ? JSON.parse(hit) : null;
  if (!days) {
    try { days = parseMeals_(await (await fetch(mealUrl_(sc.codes, mon))).json()); } catch (e) { return { school: sc.name, monday: mon, error: true }; }
    cache.put(key, JSON.stringify(days), 3 * 3600);
  }
  return { school: sc.name, monday: mon, days: days };
}
async function searchSchool(code, pw, name, office) {
  guard_(code); tpw_(pw);
  if (String(name || '').trim().length < 2) throw new Error('학교 이름을 두 글자 이상 적어 주세요.');
  return parseSchools_(await (await fetch(schoolUrl_(name, office))).json());
}

return { thermoAuto: thermoAuto, nameMark: nameMark, nameReset: nameReset, nameList: nameList, nameDel: nameDel, thermoRulesSave: thermoRulesSave, noticeList: noticeList, noticeSave: noticeSave, lessonWeek: lessonWeek, lessonFind: lessonFind, lessonSave: lessonSave, lessonDel: lessonDel, addDays_: addDays_, addEvent: addEvent, addMemo: addMemo, addMissing_: addMissing_, addNote: addNote, addTodo: addTodo, applySettings: applySettings, attendGet: attendGet, attendSave: attendSave, attendSheet_: attendSheet_, changePw: changePw, charts_: charts_, checkNo_: checkNo_, checkTeacher: checkTeacher, clearRecords: clearRecords, colA1_: colA1_, decorate_: decorate_, delMemo: delMemo, delTodo: delTodo, dish_: dish_, doGet: doGet, drawChecks_: drawChecks_, dv_: dv_, feel: feel, findRow_: findRow_, geocode_: geocode_, getAccount: getAccount, getAll: getAll, getMeal: getMeal, getWeather: getWeather, guard2_: guard2_, guard_: guard_, head_: head_, list_: list_, locked_: locked_, mailPw: mailPw, mainColor_: mainColor_, maskMail_: maskMail_, mealSchool_: mealSchool_, mealUrl_: mealUrl_, migrate_: migrate_, mmdd_: mmdd_, mondayOf_: mondayOf_, monthData: monthData, monthDays_: monthDays_, monthReport: monthReport, monthView_: monthView_, nextNo_: nextNo_, now_: now_, onEdit: onEdit, onOpen: onOpen, orderTabs_: orderTabs_, parseMeals_: parseMeals_, parseSchools_: parseSchools_, polish_: polish_, present: present, pwMailHtml_: pwMailHtml_, pwMailText_: pwMailText_, readmeAgain: readmeAgain, readmeOld_: readmeOld_, readme_: readme_, refreshAll: refreshAll, removeSamples: removeSamples, removeSamples_: removeSamples_, resetAll: resetAll, restyle: restyle, rows_: rows_, safe_: safe_, same_: same_, samples_: samples_, saveGroups: saveGroups, saveLayout: saveLayout, saveLocation: saveLocation, saveSchool: saveSchool, saveSeats: saveSeats, saveSetting: saveSetting, saveTimetable: saveTimetable, schoolUrl_: schoolUrl_, searchSchool: searchSchool, seedDemo_: seedDemo_, sendFeedback: sendFeedback, services_: services_, setSetting_: setSetting_, settings_: settings_, setup: setup, setup_: setup_, shareInfo: shareInfo, sheetTool: sheetTool, sheet_: sheet_, showUrls: showUrls, sortEvents: sortEvents, sortNotes: sortNotes, sortRange_: sortRange_, sortStudents: sortStudents, studentCount_: studentCount_, studentMap_: studentMap_, styleTab_: styleTab_, sync: sync, syncNotes_: syncNotes_, syncTabs_: syncTabs_, tail_: tail_, tally_: tally_, tap: tap, teacher: teacher, text_: text_, thermo: thermo, thermoReset: thermoReset, tidyTable_: tidyTable_, timetable_: timetable_, tint_: tint_, today_: today_, toggleRaw: toggleRaw, toggleTodo: toggleTodo, tpw_: tpw_, undoPresent: undoPresent, updateSummary: updateSummary, weekday_: weekday_, writeTable_: writeTable_ };
})();
