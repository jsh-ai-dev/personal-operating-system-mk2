# Personal Operating System — mk2

TypeScript 풀스택으로 구현한 **개인 운영체제(Personal Operating System)** 시리즈의 웹·API 중심 구현체입니다. Next.js를 단일 진입점(BFF)으로 두고, 본 도메인 API(NestJS)·인증 전용 서비스·기존 Spring 노트 서비스·Python AI 서비스를 **동일한 JWT 주체(`sub`)** 기준으로 묶는 방향으로 설계했습니다.

시리즈 저장소:

- [mk1 — Spring Boot · 노트/검색/파일/AI 요약](https://github.com/jsh-ai-dev/personal-operating-system-mk1)
- **mk2 — 본 저장소 · Next.js · NestJS · 인증**
- [mk3 — FastAPI · AI 채팅·임포트·벡터 스토어](https://github.com/jsh-ai-dev/personal-operating-system-mk3)

---

## 한 줄 요약

**React 19 / Next.js 16(App Router)** 프론트와 **NestJS + Prisma(PostgreSQL)** 백엔드를 같은 모노레포에서 운영하고, **분리된 Auth 서비스**에서 JWT를 발급·무효화하며, 브라우저는 **httpOnly 쿠키 + 서버 프록시**로 하위 서비스(mk1 노트 API, mk3 AI API)와 통신합니다.

---

## 시스템 맥락 (MSA 지향)

```text
[Browser]
    │
    ▼
[mk2 Next.js :3000]
    ├─ UI: 달력·노트·mk3 대시보드/채팅/요약/퀴즈
    ├─ /api/auth/*        → auth-service (로그인·회원가입·로그아웃·전체 세션 무효화)
    ├─ /api/backend/*     → mk2 NestJS API (일정 메모·목표 등)
    ├─ /api/notes/*       → mk1 Spring Boot REST (노트 CRUD·파일·요약·검색)
    └─ /api/mk3/*         → mk3 FastAPI (멀티 LLM 채팅·임포트·스크래퍼 등)

[mk2 NestJS API :3001] — Prisma · JWT 검증 · 레이트 리밋(Redis)
[auth-service :3002]   — 동일 DB의 User · JWT 발급 · jti 블랙리스트 · 세션 버전(sv) 기반 전체 로그아웃

[mk1 Spring :8080]     — Kotlin · JPA · Elasticsearch · Redis 세션/캐시
[mk3 FastAPI :8001]    — MongoDB · Qdrant · OpenAI/Gemini/Claude 연동
```

mk1은 원격 로그인 시 mk2가 발급한 JWT를 받아 동일 사용자 기준으로 노트 소유권을 분리할 수 있게 구성되어 있습니다.

---

## 이 저장소(mk2)에서 구현한 것

### 프론트엔드 (Next.js)

- **인증**: 로그인·회원가입, 로그아웃, **모든 기기 로그아웃**(세션 버전 갱신).
- **달력**: 월간 그리드, 이전·다음 달·오늘, 날짜별 메모/주간·월간 목표 연동, 한국 공휴일·보정 데이터(`date-holidays` + 로컬 보정).
- **노트**: mk1 REST를 프록시하는 클라이언트 — 목록·상세·작성/수정, AI 요약·파일 업로드 UI 연동.
- **mk3 통합 UI**: 대시보드(AI 서비스 설정), 멀티 프로바이더 채팅(SSE 등), 요약·퀴즈 화면 — mk3 API를 동일 BFF로 호출.

도메인 로직은 **Clean Architecture 스타일**로 `domain` / `application` / `ui`·`infrastructure`에 나누고, 달력·날짜 키 등은 **Vitest**로 검증합니다.

### 백엔드 (NestJS · `backend/`)

- **Prisma** 기반 모델: `User`, 날짜별 `CalendarMemo`, `MonthlyGoal`, `WeeklyGoal`.
- **REST**: `memos`, `monthly-goals`, `weekly-goals`, `health`.
- **보안**: 전역 `JwtAuthGuard`, `@nestjs/throttler` + **Redis 분산 저장소**(`@nest-lab/throttler-storage-redis`) — 인메모리 폴백 지원.
- **class-validator** DTO, 사용자별 데이터 경계(`CurrentUserId`).

### 인증 서비스 (`auth-service/`)

- 회원가입·로그인, JWT 발급.
- **Redis** 기반: JWT `jti` 블랙리스트(로그아웃), 사용자별 **세션 버전**(`sv`) — 버전 불일치 시 무효, “모든 기기 로그아웃”에 사용.
- User 테이블은 **backend와 동일 Prisma 스키마**를 공유(migrate 단일 소스).

### BFF 패턴 (Next Route Handlers)

- 쿠키의 액세스 토큰을 읽어 하위 서비스 호출 시 **`Authorization: Bearer`** 로 전달.
- 백엔드·mk1·mk3 URL은 환경 변수로 분리(`BACKEND_URL`, `AUTH_SERVICE_URL`, `NOTES_SERVICE_URL`, `MK3_SERVICE_URL`).

---

## 형제 저장소 요약 (시리즈 전체)

| 저장소 | 역할 | 스택 하이라이트 |
|--------|------|-----------------|
| **mk1** | 노트·파일·검색·AI 요약·Thymeleaf UI | Kotlin, Spring Boot 3.5, JPA, PostgreSQL, Redis, Elasticsearch, PDFBox |
| **mk2** | 통합 웹·일정·목표·인증·BFF | Next.js 16, React 19, NestJS 11, Prisma 7, PostgreSQL, Redis |
| **mk3** | AI 대화 저장·멀티 LLM·데이터 임포트 | Python, FastAPI, Motor/MongoDB, Qdrant, Nuxt 3(단독 프론트) |

mk3 백엔드 예: OpenAI/Gemini/Claude 채팅·비용 추적, JetBrains Codex·Claude Code·Claude Export·Gemini Takeout 등 **로컬 파일 임포트** API, 스크래퍼·헬스 체크 등.

---

## 기술 스택 (mk2)

| 영역 | 기술 |
|------|------|
| 프론트 | TypeScript, Next.js 16(App Router), React 19, Vitest, ESLint |
| API | NestJS 11, Prisma 7, PostgreSQL, class-validator |
| 인증 | NestJS, Passport JWT, bcrypt, Redis(블랙리스트·세션 버전·스로틀) |
| 인프라 | Docker Compose(PostgreSQL 16, Redis 7), 멀티 스테이지 Dockerfile(web/api/auth) |

---

## 저장소 구조 (요약)

```text
personal-operating-system-mk2/
├── src/                         # Next.js 앱
│   ├── app/                     # 라우트·Route Handlers(BFF)
│   ├── features/
│   │   ├── calendar/            # domain · application · ui · goals/memos API
│   │   ├── notes/               # mk1 연동 UI
│   │   ├── auth/
│   │   └── mk3/                 # AI 대시보드·채팅·요약·퀴즈
│   ├── components/              # AppShell 등
│   └── lib/                     # 서버 URL 헬퍼·API 클라이언트
├── backend/                     # NestJS 일정·목표 API
├── auth-service/                # NestJS 인증 전용
├── prisma 스키마               # backend/prisma (auth-service는 동일 모델 참조)
├── compose.yaml                # postgres + redis
└── compose.apps.yaml           # web + api + auth (선택)
```

---

## 실행 방법

### 사전 준비

```bash
npm install
npm install --prefix backend
npm install --prefix auth-service
```

`backend/.env`에 `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL` 등을 설정하고, Prisma 마이그레이션은 `backend` 기준으로 적용합니다.

### 1) 인프라만 Docker (일상 개발 권장)

```bash
docker compose up -d
```

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6380`

### 2) 웹 + API + Auth 동시 기동

```bash
npm run dev:all
```

- Web: `http://localhost:3000`
- API: `http://localhost:3001` (또는 `backend`의 `PORT` 설정에 따름)
- Auth: auth-service 설정 포트(예: `3002`)

mk1·mk3를 함께 쓰려면 각각 기동 후, Next 쪽 `NOTES_SERVICE_URL`(기본 예: `http://localhost:8080`), `MK3_SERVICE_URL`(기본 예: `http://localhost:8001`)을 맞춥니다.

### 3) 앱까지 전부 Docker (배포 연습)

```bash
npm run docker:up
npm run docker:up:split
```

웹 컨테이너는 `host.docker.internal`로 호스트의 mk1/mk3에 붙도록 예시가 잡혀 있습니다. 정리: `npm run docker:down:split`.

### 품질 검사

```bash
npm run lint
npm run test                    # Vitest (프론트·도메인)
npm run test --prefix backend   # Jest (백엔드)
```

---

## 설계 원칙

- **경계 분리**: 순수 도메인(달력·날짜 키) ↔ 프레임워크·HTTP.
- **동일 인증 모델**: JWT `sub`로 mk1·mk2·mk3 사용자 정렬.
- **운영 관점**: Redis 없을 때의 인메모리 폴백은 개발 편의용이며, 프로덕션에서는 Redis를 권장합니다.

---

## 로드맵 (지향)

- mk2 Nest 일정 API와 UI의 추가 뷰(주간·일간)·반복 규칙.
- mk1·mk3와의 통합 배포·관측성(구조화 로그·트레이싱) 정리.
- 인프라 as Code(k8s 등)와 시리즈 간 계약(OpenAPI) 명시.

---

## 라이선스

개인 사이드 프로젝트용입니다. 저장소 루트 및 각 패키지의 `package.json` 라이선스 필드를 따릅니다.
