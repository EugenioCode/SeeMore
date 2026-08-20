# SeeMore

<p align="center">
  <img src="./public/icons/icon128.png" alt="SeeMore 图标" width="112" height="112">
</p>

<p align="center">
  <strong>让视觉细节触手可及。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.2.0-blue" alt="版本 0.2.0">
  <img src="https://img.shields.io/badge/platform-Chrome%20148%2B-lightgrey" alt="平台：Chrome 148+">
  <img src="https://img.shields.io/badge/built%20with-Vue%203%20%7C%20TypeScript%20%7C%20Vite-42b883" alt="使用 Vue 3、TypeScript 和 Vite 构建">
</p>

<p align="center">
  <a href="./README.md">English</a> | 中文
</p>

## 项目简介

SeeMore 是一款面向视觉障碍用户的 Chrome 扩展，目标是帮助用户理解电商页面中的商品图片及其视觉细节。

项目将优先使用 Chrome Built-in AI 在浏览器本地分析图片，并以结构化、可追问的方式呈现商品外观、颜色、材质和图片差异等信息。SeeMore 强调事实优先、不确定性表达、键盘操作和屏幕阅读器体验。

> [!IMPORTANT]
> SeeMore 目前处于早期开发阶段。0.2.0 版本已完成第二阶段的单图本地 AI 分析闭环，需要在支持 Chrome Built-in AI 的 Chrome 148+ 设备上运行。

## 当前能力

- 基于 Chrome Manifest V3 的扩展基础架构
- 通过图片右键菜单、工具栏图标或 `Alt+D` 打开 Side Panel
- 从 JSON-LD 和页面内容中提取商品名称、价格、颜色、材质及描述
- Service Worker、Content Script 和 Side Panel 之间的类型安全消息通信
- 使用语义化 HTML、ARIA 状态通知和键盘友好的侧边栏界面
- 提供 16、32、48 和 128 像素的 Chrome 扩展图标
- 检测 Chrome Built-in AI 能力并显示模型准备及下载进度
- 使用结构化输出生成便于视障用户甄别商品的一段式自然语言描述
- 通过 Translator API 优先生成中文结果，翻译不可用时保留英文结果

## 版本记录

### 0.2.0 — 2026-08-20

- 完成从商品图片右键菜单打开 Side Panel 并进行图片识别的完整流程
- 接入 Chrome Built-in AI 本地图片分析，显示模型准备和下载进度
- 将图片视觉细节与页面商品信息整理为一段自然语言描述
- 增加跨域图片错误处理、取消分析、重新分析和重新读取页面状态
- 优化 Side Panel 的紧凑布局、键盘操作和高对比度视觉体验

### 0.1.0

- 完成 Chrome Manifest V3 扩展基础架构和项目初始化

## 规划能力

- 自动识别商品图片组，支持多图理解和差异比较
- 支持用户围绕当前商品继续提问

详细产品定义与开发范围请参阅 [SeeMore 产品需求文档](./SeeMore%20产品需求文档%20PRD.md)。

## 技术栈

- Chrome Extension Manifest V3
- Vue 3
- TypeScript
- Vite

## 本地开发

### 环境要求

- Node.js 20 或更高版本
- npm
- Chrome 148 或更高版本

### 安装与构建

```bash
npm install
npm run build
```

构建产物会生成在 `dist/` 目录。

### 在 Chrome 中加载

1. 打开 `chrome://extensions/`。
2. 开启右上角的“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择项目中的 `dist/` 目录。

修改代码后重新运行 `npm run build`，然后在扩展管理页面中重新加载 SeeMore。

### 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务 |
| `npm run build` | 执行类型检查并构建扩展 |
| `npm run typecheck` | 仅执行 TypeScript 类型检查 |
| `npm run preview` | 预览 Vite 构建结果 |

## 项目结构

```text
public/
├── icons/               # Chrome 扩展图标
└── manifest.json        # Manifest V3 配置
src/
├── background/          # Service Worker 与扩展事件
├── content/             # 页面上下文提取
├── shared/              # 共享类型、消息协议与常量
└── sidepanel/           # Vue Side Panel 界面
sidepanel.html           # Side Panel 入口
vite.config.ts           # 多入口构建配置
```

## 隐私说明

当前版本没有远程后端，也没有上传图片或页面内容的逻辑。后续 AI 能力将优先采用浏览器本地处理，并遵循最小权限和数据最小化原则。

## 许可证

本项目采用 [Apache License 2.0](./LICENSE) 开源。
