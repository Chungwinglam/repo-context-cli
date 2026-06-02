# Repo Context CLI

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

AI 코딩 에이전트를 위한 결정적 저장소 컨텍스트를 생성합니다.

Repo Context CLI는 로컬 저장소를 스캔해 Codex, Claude Code, Cursor 같은 도구가 재사용할 수 있는 컨텍스트 파일을 만듭니다. 프로젝트 구조, 감지된 명령, 테스트 방식, 안전 경계를 매번 다시 설명하는 비용을 줄이는 것이 목표입니다.

이 도구는 LLM 요약기가 아닙니다. 원격 AI 서비스도 호출하지 않습니다. 저장소 파일에서 사실을 결정적으로 추출하고, Git에서 검토할 수 있는 AI-agent 컨텍스트를 만드는 CLI입니다.

## 빠른 시작

먼저 dry run으로 생성 예정 내용을 확인합니다.

```bash
npx repo-context-cli pack --dry-run --for codex
npx repo-context-cli pack --for codex
```

기본 출력:

```text
AGENTS.md
PROJECT_MAP.md
TESTING.md
.repo-context/
  index.json
```

## 해결하는 문제

AI 코딩 에이전트를 사용할 때마다 사용자는 디렉터리 구조, 테스트 명령, 패키지 매니저, 수정하면 안 되는 생성 파일 등을 반복해서 설명해야 할 수 있습니다. Repo Context CLI는 이런 기본 정보를 안정적인 파일로 생성해 다음 세션도 같은 검증 가능한 사실에서 시작하게 합니다.

## 안전 경계

- LLM 호출 없음.
- 원격 서비스나 계정이 필요하지 않습니다.
- 업무 소스 코드를 수정하지 않습니다.
- 루트 `.gitignore`와 내장 노이즈 디렉터리 무시 규칙을 존중합니다.
- `.env`, `.npmrc`, SSH key 디렉터리, 개인 키 파일 같은 민감 경로를 제외합니다.
- token 또는 인증 정보가 포함된 URL처럼 보이는 명령 값은 `<redacted>`로 바꿉니다.
- 기존 수기 파일은 `--force`를 지정하지 않는 한 덮어쓰지 않습니다.

## 선택 기능

- `--html-report`: JavaScript 없는 정적 HTML 리포트를 생성합니다.
- `--editor-config`: Cursor, VS Code, 일반 AI 편집기용 정적 가이드를 생성합니다.
- `repo-context mcp`: 읽기 전용 stdio MCP 서버를 시작해 호환 클라이언트가 파일을 쓰지 않고 컨텍스트를 가져올 수 있게 합니다.

## 관련 문서

- [ROADMAP.md](ROADMAP.md): 단계 상태와 다음 목표.
- [docs/adoption.md](docs/adoption.md): 기존 저장소에 안전하게 도입하는 방법.
- [docs/examples.md](docs/examples.md): 일반적인 AI-agent 워크플로 예시.
- [docs/comparison.md](docs/comparison.md): 수동 prompt 붙여넣기, README-only onboarding, 디렉터리 트리 dump와의 비교.
- [docs/project-closeout.md](docs/project-closeout.md): 현재 프로젝트 마감 상태와 이후 유지보수 범위.
- [CONTRIBUTING.md](CONTRIBUTING.md): 로컬 개발, 테스트, 기여 안내.
