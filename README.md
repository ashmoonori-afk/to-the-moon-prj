# Influencer Michelin

**탭과 스프레드시트를 뒤지는 건 이제 그만. 딱 맞는 크리에이터를 몇 분 만에 찾아보세요.**

브랜드 키워드 하나로 인스타그램 크리에이터를 자동 수집하고, 진성도·브랜드 적합도·광고 포화도 세 가지 축으로 점수를 매겨 검증된 후보 리스트를 만들어주는 크롬 확장 프로그램입니다. 메모와 태그로 후보를 관리하고, 쇼트리스트를 CSV/JSON으로 내보낼 수 있습니다.

**To the Moon** 제작.

> [English version (README.en.md)](./README.en.md)

---

## 왜 Influencer Michelin인가요?

브랜드가 크리에이터를 검증하려면 수많은 탭, 스프레드시트, DM을 오가며 수시간을 써야 합니다. Influencer Michelin은 그 전체 과정을 하나의 확장 프로그램으로 압축합니다:

- **크리에이터 즉시 발견** — 키워드, 해시태그, 유사 계정으로 검색
- **진짜인지 확인** — 진성도 점수로 가짜 팔로워를 걸러내 파트너십 낭비 방지
- **핏을 파악** — 브랜드 적합도 점수로 실제 브랜드와 맞는 크리에이터 식별
- **빠르게 판단** — 태그, 메모, 제외, 쇼트리스트 처리를 원클릭으로
- **깔끔하게 관리** — 검색·필터 가능한 후보 데이터베이스, 자동 중복 제거

추측도, 허영 지표도 필요 없습니다. 데이터 기반 크리에이터 디스커버리.

## 주요 기능

- **계정 수집** — 키워드, 해시태그, 유사 계정 검색으로 인스타그램에서 직접 후보 발굴
- **프로필 추출** — 팔로워 수, 소개, 최근 게시물, 참여 지표 자동 캡처
- **점수화 엔진** — 세 가지 축 평가:
  - 진성도 (참여율 + 팔로워 비율 휴리스틱으로 가짜 팔로워 탐지)
  - 브랜드 적합도 (소개 + 캡션 키워드 관련성 매칭)
  - 광고 포화도 (광고 게시물 비율)
- **리뷰 워크플로우** — 메모, 태그, 리뷰 상태(대기/쇼트리스트/제외/보관) 관리
- **후보 데이터베이스** — 검색, 필터, 정렬 가능하며 자동 중복 제거
- **데이터 내보내기** — 쇼트리스트를 CSV 또는 JSON으로 내보내기
- **점수 가중치 커스터마이징** — 진성도, 브랜드 적합도, 광고 포화도 가중치 조절 (각 0-100, 기본값 40/40/20)
- **다국어 지원** — 한국어/영어 앱 내 전환 토글

## 아키텍처

메시지 패싱 아키텍처 기반으로 네 가지 주요 컴포넌트로 구성됩니다:

```
┌──────────────────────────────────────────────────────────────┐
│ 팝업 UI (popup.html, popup.css, popup/index.ts)              │
│ - 키워드 검색, 후보 목록, 필터, 설정                            │
│ - i18n 지원, 점수 가중치 설정                                  │
└────────────────────┬─────────────────────────────────────────┘
                     │ 메시지 패싱 (chrome.runtime.sendMessage)
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 백그라운드 서비스 워커 (background/index.ts)                    │
│ - 중앙 메시지 라우터 & 코디네이터                                │
│ - 점수 오케스트레이션, 후보 CRUD                                │
│ - 사용자명 기반 중복 제거, 데이터 내보내기                        │
└────────────────────┬─────────────────────────────────────────┘
                     │ 메시지 패싱
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 콘텐츠 스크립트 (content/index.ts)                             │
│ - 인스타그램 DOM 추출 (프로필, 게시물, 참여도)                    │
│ - 사용자가 프로필을 탐색할 때 instagram.com에서 실행              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 점수화 엔진 (scoring/)                                        │
│ - authenticity.ts — 휴리스틱 기반 가짜 팔로워 탐지               │
│ - brand-fit.ts — 소개 및 캡션 키워드 매칭                       │
│ - ad-saturation.ts — 피드 내 광고 게시물 비율                   │
└──────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

1. 사용자가 팝업에서 키워드를 입력하고 "수집" 클릭
2. 팝업이 백그라운드 서비스 워커에 `COLLECT_START` 메시지 전송
3. 백그라운드가 수집을 등록하고 팝업에 ID 반환
4. 사용자가 인스타그램 프로필을 탐색하면 콘텐츠 스크립트가 프로필 데이터 추출
5. 콘텐츠 스크립트가 추출된 프로필마다 `EXTRACT_RESULT` 메시지 전송
6. 백그라운드 서비스 워커가 프로필을 수신, 사용자명 기반 중복 제거 후 점수 산출
7. 후보와 점수가 IndexedDB에 저장
8. 팝업이 필터 옵션으로 후보를 조회하고 결과 표시
9. 사용자가 후보를 리뷰 (메모, 태그 추가, 상태 변경)
10. 사용자가 쇼트리스트를 CSV 또는 JSON으로 내보내기

## 기술 스택

| 구성 요소 | 기술 |
|-----------|------|
| **런타임** | Chrome Extension (Manifest V3) |
| **언어** | TypeScript (strict 모드) |
| **빌드 시스템** | Webpack 5 + ts-loader |
| **스토리지** | IndexedDB |
| **데이터 소스** | 콘텐츠 스크립트를 통한 인스타그램 DOM 추출 |
| **다국어** | JSON 로캘 파일 + 런타임 선택 |

## 시작하기

### 사전 요구 사항

- Chrome 브라우저 (최신 안정 버전 또는 Chromium 기반)
- Node.js LTS
- Git

### 설치

```bash
git clone git@github.com:ashmoonori-afk/crispy-goggles.git
cd crispy-goggles
npm install
```

### 빌드 및 로드

```bash
npm run build        # 프로덕션 빌드 → dist/
```

Chrome에 확장 프로그램 로드:

1. `chrome://extensions/` 열기
2. **개발자 모드** 활성화 (우측 상단 토글)
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. 프로젝트 루트의 `dist/` 디렉토리 선택

## 개발

### 명령어

| 명령어 | 용도 |
|--------|------|
| `npm run dev` | Webpack 감시 모드 (자동 리빌드) |
| `npm run build` | 프로덕션 빌드 (미니파이 포함) |
| `npm run typecheck` | TypeScript 타입 검증 (emit 없음) |
| `npm run lint` | src/ 대상 ESLint 검사 |
| `npm run test` | Jest 테스트 실행 |

### 파일 구조

```
src/
├── manifest.json              # Manifest V3 설정
├── background/
│   └── index.ts               # 서비스 워커 — 메시지 라우터, 스토리지
├── content/
│   └── index.ts               # 인스타그램 DOM 추출
├── popup/
│   ├── popup.html             # 팝업 UI
│   ├── popup.css              # 팝업 스타일
│   └── index.ts               # 팝업 로직 및 이벤트 핸들러
├── scoring/
│   ├── index.ts               # 점수 오케스트레이션 (가중 합계)
│   ├── authenticity.ts        # 진성도 휴리스틱 (0–100)
│   ├── brand-fit.ts           # 브랜드 적합도 점수 (0–100)
│   └── ad-saturation.ts       # 광고 포화도 비율 (0.0–1.0)
├── storage/
│   └── database.ts            # IndexedDB 래퍼 (CRUD)
├── shared/
│   ├── types.ts               # 모든 인터페이스 & 메시지 계약
│   ├── validation.ts          # 경계에서의 입력 검증
│   └── i18n.ts                # 로캘 감지 & 문자열 로딩
└── _locales/
    ├── en.json                # 영어 문자열
    └── ko.json                # 한국어 문자열
```

### 주요 모듈

| 모듈 | 역할 | 주요 내보내기 |
|------|------|-------------|
| `types.ts` | 데이터 모델 & 메시지 계약 | Candidate, CandidateScores, Message, MessageType |
| `database.ts` | IndexedDB 작업 | putCandidate, queryCandidates, getCollection |
| `scoring/index.ts` | 점수 오케스트레이션 | scoreCandidate(profile, keyword, weights) |
| `background/index.ts` | 메시지 조율 | chrome.runtime.onMessage 리스너 |
| `popup/index.ts` | UI & 상태 관리 | 이벤트 핸들러, 필터링, 내보내기 |

### 메시지 타입

확장 프로그램은 타입이 지정된 메시지로 통신합니다. 주요 메시지 타입:

- `COLLECT_START` — 인플루언서 수집 워크플로우 시작
- `EXTRACT_RESULT` — 콘텐츠 스크립트가 추출된 프로필 반환
- `EXTRACT_ERROR` — 콘텐츠 스크립트가 추출 실패 보고
- `CANDIDATE_LIST` — 필터로 후보 조회
- `CANDIDATE_UPDATE` — 후보 리뷰 업데이트 (상태/메모/태그)
- `CANDIDATE_EXPORT` — 쇼트리스트 내보내기 (CSV 또는 JSON)
- `SCORING_WEIGHTS_GET` / `SCORING_WEIGHTS_SET` — 점수 설정 조회/변경

모든 메시지 페이로드와 응답 구조는 `src/shared/types.ts`를 참고하세요.

### 점수 산출 알고리즘

점수화 엔진은 세 가지 독립 점수의 가중 합계를 산출합니다:

1. **진성도 (0–100)** — 참여율과 팔로워 대 팔로잉 비율을 기반으로 가짜 팔로워 탐지
2. **브랜드 적합도 (0–100)** — 소개와 최근 게시물 캡션에서 검색 키워드와의 매칭
3. **광고 포화도 (0.0–1.0)** — 최근 타임라인 내 광고 게시물 비율

가중 합계 계산:

```
adScore = (1 - adSaturation) * 100  // 반전: 광고가 적을수록 높은 점수
weightedTotal = (auth × authWeight + fit × fitWeight + adScore × adSatWeight) / totalWeight
```

기본 가중치: 진성도 40%, 브랜드 적합도 40%, 광고 포화도 20%. 설정 패널에서 사용자 지정 가능합니다.

## 브라우저 지원

- Chrome / Chromium (Manifest V3 호환)
- 최소 버전: Chrome 88 (MV3 지원)

## 프로젝트 문서

| 문서 | 내용 |
|------|------|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | 미션, 비전, 가치, 제품 범위 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 시스템 설계, 컴포넌트 경계, 데이터 흐름 |
| [API_DESIGN.md](./API_DESIGN.md) | 내부 API 계약과 데이터 모델 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 코드, 문서, 버그 리포트 기여 방법 |
| [SECURITY.md](./SECURITY.md) | 보안 정책, 취약점 보고, 위협 모델 |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | 문체, 용어, 포맷 표준 |

## 팀

| 역할 | 이름 | 담당 |
|------|------|------|
| CEO | Jonathan | 전략, 제품 방향 |
| CTO | Alex | 아키텍처, 엔지니어링 실행 |
| 백엔드 엔지니어 | Sam | API, 데이터베이스, 서버 로직 |
| 프론트엔드 엔지니어 | Jordan | UI/UX, 컴포넌트, 상태 관리 |
| DevOps 엔지니어 | Riley | CI/CD, 배포, 인프라 |
| CMO | Maya | 마케팅, 브랜드, 콘텐츠, 성장 |
| QC 리드 | Morgan | 테스트, 품질 게이트, 버그 관리 |

## 라이선스

Proprietary. All rights reserved by To the Moon.
