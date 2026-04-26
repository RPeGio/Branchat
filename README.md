# Branchat

一个基于 Tauri + Vue + TypeScript 开发的分支式对话AI桌面应用，支持多轮对话、历史记录管理。

## 功能特性

- 🎯 **分支式对话**：AI提供选项，用户可以根据选项进行对话，同时可以通过每次选择生成的选项树回溯至之前的选择（尚待完善）
- 📚 **历史记录**：自动保存对话历史，支持加载和管理历史对话
- 🔧 **用户配置**：可自定义系统提示词、当前对话模型参数等设置
- 🎨 **美观界面**：使用Tailwind CSS打造现代简洁的界面

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **包管理器**：pnpm
- **桌面应用**：Tauri 2
- **样式库**：Tailwind CSS 4
- **Markdown处理**：Unified.js + Remark + Rehype
- **状态管理**：Vue 3 Composition API
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

1. **输入消息**：在底部输入框中输入您的问题或指令，按Enter键发送
2. **查看历史**：点击左侧历史记录按钮，查看和加载历史对话
3. **创建新对话**：在历史记录面板中点击"＋"按钮
4. **配置设置**：点击右侧设置按钮，自定义系统提示词和模型参数

### 系统提示词

系统提示词用于指导AI的行为和回答风格。您可以在设置面板中自定义全局系统提示词，也可以为每个对话设置单独的系统提示词。

## 配置说明

### API密钥配置

1. **环境变量**：在 `.env.development` 文件中设置 `VITE_API_KEY`
2. **应用内设置**：在应用中点击"显示Token"按钮，输入您的API密钥

### 模型参数配置

在设置面板中，您可以调整以下模型参数：
- **temperature**：控制AI回答的创造性，值越高回答越多样
- **max_tokens**：限制AI回答的最大长度
- **top_p**：控制词的多样性，值越低回答越集中
- **frequency_penalty**：控制重复词的惩罚力度

        
