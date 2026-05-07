# Branchat

一个基于 Tauri + Vue + TypeScript 开发的分支式对话 AI 桌面应用，支持多轮对话、智能选项分支、历史记录管理、对话导入导出。

## 功能特性

- **分支式对话**：AI 提供选项，用户可根据选项分支进行对话，支持正向/反向选择，选项可附带额外输入
- **对话回溯**：在任何 AI 消息处点击「回溯至这里」，回退到该位置并删除后续消息，支持分支重选
- **历史记录**：自动保存对话历史，支持加载、删除历史对话
- **对话导入导出**：以 JSON 格式导出/导入单条历史对话，方便分享和备份
- **用户配置**：可自定义全局系统提示词、当前对话系统提示词、temperature、max_tokens、top_p、frequency_penalty，支持 API Key 查看与修改
- **多模型支持**：支持切换 pro / flash 模型
- **余额查询**：输入 /balance 命令查询当前 API Key 的可用状态和剩余余额
- **快捷命令**：输入 /clearHistory 一键清空所有历史记录
- **Markdown 渲染**：AI 回答支持完整 Markdown 渲染，包含代码块、数学公式 (KaTeX)、表格、引用等
- **美观界面**：Tailwind CSS 4 打造的现代简洁 UI

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **包管理器**：pnpm
- **桌面应用**：Tauri 2
- **样式库**：Tailwind CSS 4
- **Markdown 处理**：Unified.js + Remark + Rehype + KaTeX
- **状态管理**：Pinia
- **存储**：Tauri Plugin Store

## 安装与运行

### 前置要求

- Node.js 18+
- Rust 1.75+
- Tauri CLI

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/RPeGio/Branching-interactive-AI-desktop-application.git
   cd my-first-tauri
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **开发模式运行**
   ```bash
   pnpm tauri dev
   ```

4. **构建应用**
   ```bash
   pnpm tauri build
   ```

## 使用说明

### 基本操作

1. **输入消息**：在底部输入框中输入问题或指令，按 Enter 键发送
2. **查看历史**：点击左侧时钟按钮，查看和加载历史对话
3. **创建新对话**：在历史记录面板中点击右上角加号按钮
4. **配置设置**：点击右侧齿轮按钮，自定义系统提示词、模型参数和 API Key
5. **对话回溯**：鼠标悬停在 AI 消息上，点击「回溯至这里」可回退对话

### 分支对话

AI 在回复时会自动判断是否需要用户做选择。如需选择，底部会显示选项按钮，点击即可沿该分支继续对话。选项可附带输入框供用户补充细节，也可点击「跳过选项」忽略。

### 快捷命令

在输入框中输入以下命令：
- /balance - 查询 API Key 余额
- /clearHistory - 清空所有历史记录

## 配置说明

### API 密钥配置

1. **环境变量**：在 .env.development 文件中设置 VITE_API_KEY
2. **应用内设置**：在设置面板中点击「显示Token」按钮，输入您的 API 密钥

### 模型参数

在设置面板中可调整以下参数：
- **temperature**：控制创造性，值越高回答越多样
- **max_tokens**：限制回答的最大长度
- **top_p**：控制词的多样性，值越低回答越集中
- **frequency_penalty**：控制重复词的惩罚力度

### 系统提示词

- **全局系统提示词**：作用于所有对话的默认系统提示词
- **对话级系统提示词**：仅作用于当前对话，覆盖全局设置
