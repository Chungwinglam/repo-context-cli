# Repo Context CLI

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

为 AI 编码代理生成确定性的仓库上下文。

Repo Context CLI 会扫描本地仓库，把项目事实转换成可复用的上下文文件，帮助 Codex、Claude Code、Cursor 和类似工具更快理解项目结构、命令、测试方式和安全边界。

它不是 LLM 总结器，也不会调用远程 AI 服务。它基于仓库文件做确定性检测，适合需要可审查、可重复、可提交到 Git 的 AI-agent 上下文。

## 快速开始

先用 dry run 查看将要生成的内容：

```bash
npx repo-context-cli pack --dry-run --for codex
npx repo-context-cli pack --for codex
```

默认输出：

```text
AGENTS.md
PROJECT_MAP.md
TESTING.md
.repo-context/
  index.json
```

## 解决的问题

AI 编码代理经常需要用户反复粘贴项目结构、测试命令、包管理器、不要编辑哪些文件等信息。Repo Context CLI 把这些基础事实生成成稳定文件，让后续会话从同一组可验证信息开始。

## 安全边界

- 无 LLM 调用。
- 无需远程服务或账号。
- 不会编辑业务源码。
- 遵守根目录 `.gitignore` 和内置噪声目录忽略规则。
- 排除 `.env`、`.npmrc`、SSH key 目录和私钥文件等敏感路径。
- 看起来像 token 或带凭据 URL 的命令值会被替换为 `<redacted>`。
- 只有 Repo Context CLI 生成过的文件才会默认覆盖；用户手写文件会被跳过，除非显式传入 `--force`。

## 可选能力

- `--html-report`：生成无 JavaScript 的静态 HTML 报告。
- `--editor-config`：生成 Cursor、VS Code 和通用 AI 编辑器的静态使用指南。
- `repo-context mcp`：启动只读 stdio MCP 服务，让兼容客户端读取仓库上下文而不写文件。

## 相关文档

- [ROADMAP.md](ROADMAP.md)：阶段状态和下一阶段目标。
- [docs/adoption.md](docs/adoption.md)：如何安全地把 Repo Context CLI 引入已有仓库。
- [docs/examples.md](docs/examples.md)：常见 AI-agent 工作流示例。
- [docs/comparison.md](docs/comparison.md)：与手动粘贴 prompt、README-only onboarding、目录树 dump 的对比。
- [docs/project-closeout.md](docs/project-closeout.md)：当前项目收尾状态和后续维护范围。
- [CONTRIBUTING.md](CONTRIBUTING.md)：本地开发、测试和贡献说明。
