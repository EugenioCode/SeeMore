# SeeMore 产品需求文档

**版本：** v1.0  
**日期：** 2026-08-18  
**项目类型：** Chrome Extension / Accessibility / Built-in AI  
**开源协议：** Apache License 2.0  
**产品阶段：** MVP

---

# 1. 项目概述

## 1.1 项目名称

**SeeMore**

英文 Slogan：

> **SeeMore — Making visual details accessible.**

## 1.2 项目描述

SeeMore 是一款面向视障及低视力用户的 Chrome AI 无障碍插件。

插件利用 Chrome 浏览器内置多模态 AI 理解网页中的商品图片，并结合商品标题、颜色、商品描述等页面上下文，将商品的颜色、版型、结构、设计细节、展示角度、多图差异以及视觉特征转换为详细、结构化、可由屏幕阅读器读取的文本信息。

SeeMore 的目标不是简单生成一句图片 Caption，而是尽可能补充：

> **普通用户通过观看商品图片自然获得，但传统 Alt Text 无法完整表达的商品视觉信息。**

---

# 2. 项目背景

电商网站中的商品信息通常由两部分组成：

```text
文字信息
+
视觉信息
```

文字信息包括：

- 商品名称
- 价格
- 颜色名称
- SKU
- 尺码
- 材质
- 商品描述

而大量影响购买决策的信息只存在于商品图片中，例如：

- 衣服实际轮廓
- 腰线位置
- 裙摆长度
- 开叉位置
- 背部结构
- 图案分布
- 面料视觉质感
- 模特穿着效果
- 包袋结构
- 鞋跟形态
- 不同图片之间展示的信息差异

视障用户依赖屏幕阅读器浏览网站，而目前多数商品图片提供的 Alt Text 信息十分有限，例如：

> Women's black dress

或者：

> Model wearing dress

这种信息能够告诉用户“图片是什么”，但无法帮助用户形成对商品的完整认知。

W3C 的无障碍指南同样强调，图片文本替代的核心应是表达图片所传递的意义，而非机械地逐像素描述图片；对于需要大量细节的信息，更适合提供独立的长描述，而不是把全部内容塞入 `alt`。

因此 SeeMore 不应简单覆盖网站原有 `alt`，而应该提供独立的 **AI Visual Description Layer**。

---

# 3. 产品愿景

SeeMore 希望解决的问题不是：

> “这张图片是什么？”

而是：

> “如果我能够看到这张商品图片，我会从图片里获得哪些对购买有帮助的信息？”

最终形成：

```text
商品图片
        ↓
AI Visual Understanding
        ↓
结构化视觉信息
        ↓
Screen Reader / 用户阅读
        ↓
更完整的商品认知
```

长期目标是让视觉信息成为一种可以被：

**查询、比较、阅读和理解的数据。**

---

# 4. 产品目标

## 4.1 核心目标

SeeMore 需要帮助用户完成四件事情：

### G1. 理解单张商品图片

告诉用户商品的：

- 商品类型
- 主色与辅助色
- 图案
- 外形
- 版型
- 结构
- 设计细节
- 视觉材质特征
- 展示角度
- 模特穿着效果

### G2. 理解商品图片组

识别：

```text
正面
侧面
背面
细节
面料
场景
```

并解释不同图片分别提供了哪些新增信息。

### G3. 区分事实与视觉推断

例如：

页面明确写：

> 100% Polyester

可以描述：

> 商品页面标注材质为 100% 聚酯纤维。

如果仅从图片观察：

> Fabric appears smooth and slightly glossy.

则应描述：

> 从视觉上看，面料表面较光滑并有轻微光泽，实际材质无法仅通过图片确认。

### G4. 支持用户继续询问

例如：

> 后背是什么样的？

> 这条裙子腰线高吗？

> 第二张和第一张有什么区别？

> 包上面有没有 Logo？

---

# 5. 非目标

SeeMore MVP 暂不承担以下职责：

- 不判断商品质量好坏
- 不进行审美评分
- 不判断商品是否适合具体用户
- 不推测用户身体情况
- 不进行商品推荐
- 不自动购买商品
- 不修改商品页面业务数据
- 不替代网站已有 Alt Text
- 不自动修改原始 `<img alt="">`
- 不依赖云端 AI 服务
- 不建立用户商品浏览画像

SeeMore 首先是一层：

> **Visual Accessibility Layer**

而不是购物 Agent。

---

# 6. 目标用户

## 6.1 核心用户

### 完全失明用户

主要通过：

- NVDA
- JAWS
- VoiceOver
- Chrome + Screen Reader

浏览网页。

核心需求：

> 将无法访问的视觉信息转换成高质量文本。

### 低视力用户

能够看到部分视觉内容，但：

- 难以识别细小结构
- 难以辨认复杂图案
- 难以查看商品细节
- 依赖页面放大和语音辅助

核心需求：

> 快速提取关键视觉细节。

## 6.2 次级用户

未来也可以覆盖：

- 老年用户
- 色觉障碍用户
- 阅读障碍用户
- 普通购物用户

但这些不影响 MVP 的产品设计优先级。

---

# 7. 产品设计原则

## 7.1 Information First

首先提供影响商品理解的信息，而不是文学化描述图片。

错误：

> 一位优雅女性站在阳光下，穿着一条迷人的黑色长裙。

正确：

> 黑色无袖长裙。方领、细肩带，上身修身，腰部明显收紧，下摆从腰部逐渐展开，长度接近脚踝。

---

## 7.2 Important First

信息按照购买价值排序：

```text
这是什么
↓
整体视觉
↓
结构
↓
重要细节
↓
穿着效果
↓
图片视角
↓
次要视觉信息
```

---

## 7.3 Fact Before Guess

信息来源分为：

```text
Page Fact
Visual Observation
Visual Estimation
Unknown
```

AI 必须明确区分：

**页面事实 ≠ 图片观察 ≠ AI 推测。**

---

## 7.4 Never Pretend to Know

无法确认的信息必须明确表达不确定性。

例如：

> 无法从图片确认面料成分。

而不是：

> 这是一件棉质连衣裙。

---

## 7.5 No Unexpected Speech

插件不得在用户打开商品页面后自动朗读所有图片。

所有详细分析必须由：

- 用户主动打开
- 用户聚焦
- 用户执行快捷键
- 用户选择菜单

触发。

---

# 8. 用户核心场景

## 场景 A：查看单张商品图

用户浏览 PDP：

```text
商品：
Black Square Neck Maxi Dress

图片：
1 / 6
```

用户触发 SeeMore。

结果：

```text
黑色无袖长款连衣裙。

整体
裙长接近脚踝，上身较修身，腰部收紧，
下摆从腰部开始逐渐展开。

设计细节
• 方领
• 细肩带
• 高腰设计
• 裙摆有轻微褶皱

图片视角
模特正面站立展示。

不确定信息
无法仅通过图片确认面料成分。
```

---

# 9. 核心功能

功能优先级定义：

```text
P0 = MVP 必须实现
P1 = 第一阶段增强
P2 = 后续能力
```

---

# 10. P0：单图 AI 识别

## FR-001 图片触发识别

用户可以通过以下方式触发：

### 方式一

商品图片右键：

> 使用 SeeMore 描述图片

### 方式二

Chrome Toolbar：

> SeeMore

打开当前页面的 Side Panel。

### 方式三

快捷键：

> Alt + D

具体快捷键允许用户后续自定义。

---

# 11. P0：Side Panel

SeeMore 主界面使用 Chrome Side Panel。

Chrome 的 Side Panel API 可以让扩展 UI 与网页同时存在，并允许通过 Toolbar、快捷键、Context Menu 或用户交互打开，非常适合 SeeMore 这种伴随当前网页使用的辅助工具。

基本结构：

```text
┌──────────────────────────┐
│ SeeMore                  │
│                          │
│ 商品图片 1 / 6           │
│                          │
│ 图片描述                  │
│ ─────────────────────── │
│ 黑色无袖长款连衣裙……     │
│                          │
│ 外观                     │
│ 黑色 / 纯色 / 长款       │
│                          │
│ 设计细节                  │
│ • 方领                    │
│ • 细肩带                  │
│ • 高腰                    │
│                          │
│ 穿着效果                  │
│ ……                       │
│                          │
│ 不确定信息                │
│ ……                       │
│                          │
│ ← 上一张        下一张 → │
│                          │
│ Ask about this image     │
└──────────────────────────┘
```

---

# 12. P0：商品页面上下文识别

SeeMore 不应该只把图片传递给 AI。

Content Script 需要提取当前页面中可能与商品相关的信息：

```text
document.title
Product title
Price
Color
Selected variant
Image alt
Image src
Image position
Product description
Material
SKU
Structured Data
JSON-LD
```

最终形成：

```text
Image
+
Product Context
↓
AI
```

例如：

```text
Product:
Floral Cutout Maxi Dress

Selected Color:
Dark Green

Material:
100% Polyester

Features:
Adjustable straps
Back zipper
```

模型就不需要从图片猜测材质。

---

# 13. P0：结构化图片理解

AI 不直接生成自由文本，而首先输出结构化数据。

推荐数据模型：

```json
{
  "summary": "",
  "category": "",
  "visual": {
    "primaryColor": "",
    "secondaryColors": [],
    "pattern": "",
    "shape": "",
    "fit": "",
    "length": ""
  },
  "details": [],
  "wearingEffect": "",
  "view": "",
  "visibleText": [],
  "uncertainties": [],
  "sourceFacts": []
}
```

具体 Schema 根据商品类型允许动态扩展。

---

# 14. 商品类型适配

不同商品关注的视觉信息不同。

SeeMore 不应该所有商品都使用完全相同的 Prompt。

例如识别：

```text
dress
```

关注：

```text
neckline
sleeve
strap
waist
fit
length
hem
cutout
back
slit
pattern
```

识别：

```text
shoe
```

关注：

```text
toeShape
heelType
heelHeightVisual
closure
sole
upper
details
```

识别：

```text
bag
```

关注：

```text
shape
handle
strap
closure
hardware
logo
compartments
```

形成：

```text
Category Detection
        ↓
Category Prompt
        ↓
Product-specific Analysis
```

---

# 15. P0：Chrome Built-in AI

核心视觉理解使用：

**Chrome Prompt API / Gemini Nano**

当前 Prompt API 支持：

```text
text
image
audio
```

输入，其中视觉输入可以直接使用 `HTMLImageElement`、`HTMLCanvasElement`、`ImageBitmap`、`Blob`、`ImageData` 等类型，并且支持一次 Prompt 中提供多张图片。

SeeMore MVP 主要使用：

```text
text
+
image
```

---

# 16. AI Structured Output

AI 输出必须使用：

```text
responseConstraint
+
JSON Schema
```

而不是依赖：

> “Please return valid JSON.”

Chrome Prompt API 当前支持通过 `responseConstraint` 使用 JSON Schema 约束模型输出，Chrome 官方也推荐在需要固定格式时使用 Structured Output，而不是单靠 Prompt 要求模型返回 JSON。

---

# 17. 中文支持

当前 Prompt API 正式支持的语言包括：

```text
English
Japanese
Spanish
German
French
```

尚未直接包含中文。

因此 SeeMore 中文链路设计为：

```text
商品图片
↓
Prompt API
↓
English Structured Result
↓
Translator API
↓
Chinese
↓
UI
```

Chrome Translator API 支持 `zh` 和 `zh-Hant`，并在桌面端运行。

---

# 18. P0：描述层级

每张图片提供两种信息密度。

## 简洁描述

用于快速浏览：

> 黑色方领吊带长裙，上身修身、腰部收紧，下摆宽松展开。

目标：

约一到两句话。

## 详细描述

用于深入理解：

```text
整体外观
颜色
图案
版型
结构
设计细节
穿着效果
图片视角
可见文字
不确定信息
```

这样避免每次都向屏幕阅读器输出大量内容。

---

# 19. P0：不确定性机制

结果必须允许字段：

```json
{
  "uncertainties": [
    {
      "topic": "material",
      "message": "Material cannot be determined reliably from the image."
    }
  ]
}
```

禁止：

```text
可能是
大概是
应该是
```

混入事实描述中而没有明确标识。

---

# 20. P0：首次模型下载

Chrome 内置模型首次使用时可能需要下载。

Prompt API 使用的模型与 API 本身分离，需要根据 `LanguageModel.availability()` 判断当前状态，并在需要下载时向用户显示下载进度。

界面状态：

```text
SeeMore AI 尚未准备完成

正在准备本地 AI 模型

██████████░░░░
67%

模型只需要首次下载。
```

必须避免：

```text
空白页面
无限 Loading
无状态提示
```

---

# 21. P0：AI 能力检测

启动时执行：

```text
LanguageModel.availability()
Translator.availability()
```

状态分为：

```text
available
downloadable / downloading
unavailable
```

不同状态展示明确说明。

---

# 22. P0：无障碍设计

SeeMore 自己必须是一款完整符合无障碍使用逻辑的插件。

要求：

### Keyboard First

所有功能均可通过键盘完成。

不得存在：

> 只能 Hover 使用

的核心功能。

### Semantic HTML

优先：

```html
button
nav
section
heading
input
```

而不是大量：

```html
div onclick
```

### Focus Management

Side Panel 打开后：

焦点进入：

> SeeMore 商品图片描述

分析完成后，不主动把焦点从用户当前操作位置抢走。

### Screen Reader Announcement

状态变化：

```text
正在分析图片
分析完成
分析失败
正在下载 AI 模型
```

通过适当的 Live Region 提供。

### Heading Structure

例如：

```text
H1 SeeMore

H2 图片概览

H2 外观

H2 设计细节

H2 穿着效果

H2 不确定信息
```

### 不依赖颜色表达状态

禁止仅使用：

```text
绿色 = 成功
红色 = 错误
```

必须同时提供文字或图标语义。

---

# 23. 不覆盖网站 Alt

SeeMore MVP 默认：

**不修改网页现有 Alt Text。**

原因：

原有 Alt 属于网站自身 Accessibility Tree 的一部分。

SeeMore 提供：

```text
Original Accessibility Layer
+
SeeMore AI Description Layer
```

而不是：

```text
SeeMore
↓
Replace Website Alt
```

W3C 建议 `alt` 保持尽可能简洁；当图片信息复杂、需要更详细说明时，应使用独立的长描述方案。

---

# 24. P1：商品 Gallery 自动识别

SeeMore 自动发现当前 PDP 中的：

```text
Product Gallery
```

主要判断：

- 图片尺寸
- DOM 位置
- 相邻图片
- Slider / Carousel
- Product JSON
- Schema.org Product
- Image URL
- 点击行为
- 当前 Active Image

最终得到：

```text
ProductGallery {
  images: []
  currentIndex: 0
}
```

---

# 25. P1：多图理解

对于：

```text
1 正面
2 侧面
3 背面
4 面料
5 细节
6 场景
```

SeeMore 应输出：

> 商品共有 6 张图片。

随后描述：

```text
图片 1
主要展示整体正面。

图片 2
展示侧面轮廓。
相比图片 1，可以看到裙摆左侧存在开叉。

图片 3
展示背部。
可以看到背部使用交叉肩带。

图片 4
展示面料特写。
可以看到细密纵向纹理。

图片 5
展示腰部结构。

图片 6
主要为场景展示，
没有发现明显新的商品结构信息。
```

---

# 26. P1：图片差异分析

提供按钮：

> 与上一张比较

用户也可以询问：

> 这一张和第一张有什么区别？

AI 输入：

```text
Image A
+
Image B
```

输出：

```text
sameInformation
newInformation
changedView
visibleDetails
```

Prompt API 当前支持一次会话中提供多张视觉输入，因此可以直接实现两张或多张图片比较。

---

# 27. P1：Ask SeeMore

Side Panel 底部增加：

```text
Ask about this image
```

用户可以输入：

> 后背露得多吗？

> 裙子有没有开叉？

> Logo 在哪里？

> 这个包是软的还是硬挺的？

AI 使用：

```text
当前图片
+
商品 Context
+
上一轮结果
+
用户问题
```

进行回答。

---

# 28. Ask 模式原则

用户询问：

> 这件衣服舒服吗？

AI 不应该回答：

> 很舒服。

应该回答：

> 图片无法判断实际穿着舒适度。从视觉上看版型较贴身，但舒适度还会受到面料弹性、尺寸和个人体型影响。

---

# 29. 页面信息融合策略

信息优先级：

```text
Structured Product Data
        ↓
Visible Product Text
        ↓
Image Observation
        ↓
AI Estimation
```

例如：

页面写：

```text
Color: Midnight Navy
```

AI 视觉判断：

```text
looks dark blue
```

最终：

> 商品页面标注颜色为 Midnight Navy，图片中视觉上呈深蓝色。

避免模型覆盖网站提供的明确事实。

---

# 30. AI Prompt 原则

System Prompt 需要明确：

```text
You are a visual accessibility assistant
specialized in ecommerce product images.

Describe visual information that would
be useful to a blind or visually impaired shopper.

Prioritize purchase-relevant visual details.

Never infer facts that cannot reliably
be determined from the image.

Distinguish:
- page facts
- visual observations
- uncertain visual estimations

Avoid subjective beauty judgments.
Avoid marketing language.
```

---

# 31. AI 会话架构

不建议所有商品图片共享一个不断增长的 Session。

采用：

```text
Base Session
   │
   ├── Image Session 1
   ├── Image Session 2
   ├── Image Session 3
   └── Compare Session
```

Base Session 保存：

```text
System Prompt
Schema
Product Context
```

每个分析任务 Clone 一次。

Chrome 官方当前同样建议建立仅包含系统指令的基础 Session，再针对独立任务 Clone，避免无关上下文相互干扰，同时及时销毁不再使用的 Session。

---

# 32. 技术架构

建议：

```text
Chrome Extension
│
├── Background Service Worker
│
│   ├── Context Menu
│   ├── Side Panel control
│   └── Message routing
│
├── Content Script
│
│   ├── Product detection
│   ├── Image detection
│   ├── Gallery detection
│   └── Product context extraction
│
├── Side Panel
│
│   └── Vue 3
│
├── AI Layer
│
│   ├── LanguageModel
│   ├── Image Analyzer
│   ├── Product Analyzer
│   ├── Compare Analyzer
│   └── Prompt Manager
│
├── Translation Layer
│
│   └── Translator API
│
├── Accessibility Layer
│
│   ├── Focus Manager
│   ├── Live Region
│   └── Keyboard Controller
│
└── Storage
    └── chrome.storage
```

---

# 33. 推荐技术栈

```text
Chrome Manifest V3

Vue 3
TypeScript
Vite

Pinia
可选

Chrome Side Panel API

Chrome Prompt API
Chrome Translator API

JSON Schema
```

原则：

**首版尽量减少 UI Library 依赖。**

Accessibility 基础组件优先自己控制 Semantic HTML。

---

# 34. 项目目录建议

```text
seemore/
│
├── src/
│   │
│   ├── background/
│   │   ├── index.ts
│   │   ├── context-menu.ts
│   │   └── side-panel.ts
│   │
│   ├── content/
│   │   ├── index.ts
│   │   ├── image-detector.ts
│   │   ├── gallery-detector.ts
│   │   ├── product-detector.ts
│   │   └── context-extractor.ts
│   │
│   ├── sidepanel/
│   │   ├── App.vue
│   │   ├── components/
│   │   ├── views/
│   │   └── stores/
│   │
│   ├── ai/
│   │   ├── language-model.ts
│   │   ├── session-manager.ts
│   │   ├── image-analyzer.ts
│   │   ├── compare-analyzer.ts
│   │   ├── translator.ts
│   │   └── prompts/
│   │
│   ├── accessibility/
│   │   ├── focus.ts
│   │   ├── announcer.ts
│   │   └── keyboard.ts
│   │
│   ├── schemas/
│   │   ├── product-image.schema.ts
│   │   ├── clothing.schema.ts
│   │   ├── shoe.schema.ts
│   │   └── bag.schema.ts
│   │
│   └── shared/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── ACCESSIBILITY.md
│   └── CONTRIBUTING.md
│
├── manifest.json
├── LICENSE
├── README.md
└── package.json
```

---

# 35. 浏览器兼容策略

MVP 产品支持范围定义为：

**Chrome 148+ Desktop**

支持：

```text
Windows
macOS
Linux
支持内置 AI 的 ChromeOS 设备
```

同时必须通过运行时 Feature Detection 判断能力，而不是仅判断 Chrome Version。

Chrome 官方当前列出的 foundation-model API 运行条件还包括一定的存储与计算资源，并且当前不支持 Android、iOS 以及普通非 Chromebook Plus 的 ChromeOS 设备。

因此：

```text
Chrome Version
≠
AI Guaranteed Available
```

---

# 36. 隐私原则

SeeMore 默认采用：

> **Local First**

Chrome 内置 foundation model 在模型完成初次下载后的推理过程中无需把 Prompt 数据发送到 Google 或第三方。

因此 MVP：

- 不上传商品图片
- 不上传商品页面内容
- 不建立后端
- 不保存图片
- 不保存商品浏览历史
- 不收集用户问题内容
- 不要求登录
- 不要求账号
- 不要求 API Key

---

# 37. 权限原则

Chrome Extension Permission 遵循：

> Least Privilege

只请求实际需要权限。

预计：

```text
sidePanel
contextMenus
storage
activeTab
scripting
```

Host Permission 应尽量减少。

第一阶段优先考虑：

```text
activeTab
```

而不是：

```text
<all_urls>
```

只有自动商品识别确有必要时再评估扩大权限范围。

---

# 38. 安全

任何 AI 输出均视为：

> Untrusted Content

不得直接：

```javascript
element.innerHTML = aiResponse
```

如果需要解析 Markdown：

必须经过 Sanitization。

Chrome 官方目前也明确建议把 LLM 输出作为不可信输入处理，并在渲染前进行清理。

---

# 39. 性能目标

以下为产品目标值，需要在真实设备 EVAL 后调整。

### Side Panel

打开 UI：

**P95 < 500 ms**

不包含 AI Model 初始化。

### AI Warm State

单张普通商品图片：

**目标 P50 < 5 秒**

### AI Cold State

必须：

- 提供明确 Loading
- 提供模型下载状态
- 不冻结页面
- 支持取消分析

### 输入控制

只向 AI 传递必要信息。

禁止直接把：

```text
document.documentElement.innerHTML
```

整体传入模型。

Chrome 官方同样建议过滤无关 DOM、HTML 和元数据，以减少延迟和 Context 消耗。

---

# 40. 状态设计

SeeMore 至少存在：

```text
IDLE

PREPARING_MODEL

DOWNLOADING_MODEL

IMAGE_LOADING

ANALYZING

TRANSLATING

SUCCESS

UNSUPPORTED

ERROR

CANCELLED
```

每个状态必须：

**视觉可见 + Screen Reader 可感知。**

---

# 41. 错误处理

例如：

### 图片无法读取

> SeeMore 无法读取这张图片，请尝试选择其他图片。

### Built-in AI 不可用

> 当前设备暂时无法运行 Chrome 内置 AI。

### 模型需要下载

> SeeMore 需要首次准备本地 AI 模型。

### AI 分析失败

> 图片分析没有成功，可以重新尝试。

### Translation 失败

英文结果仍然可展示：

> 中文翻译暂时不可用，以下显示英文视觉描述。

---

# 42. MVP 完整用户流程

```text
用户打开商品页面
        ↓
右键商品图片
        ↓
使用 SeeMore 描述图片
        ↓
Side Panel 打开
        ↓
检查 AI Availability
        ↓
      可用？
     /    \
   Yes     No
   ↓       ↓
提取图片   显示准备状态
   ↓
提取 Product Context
   ↓
图片 + Context
   ↓
Prompt API
   ↓
Structured JSON
   ↓
Translator API
   ↓
中文描述
   ↓
Side Panel 展示
   ↓
Screen Reader 阅读
```

---

# 43. MVP 功能范围

v1.0 必须完成：

```text
✓ Chrome Extension MV3

✓ Side Panel

✓ 右键识别图片

✓ 单张图片 AI 分析

✓ Product Context 提取

✓ Structured JSON

✓ 中文翻译

✓ 简洁描述

✓ 详细描述

✓ 不确定性表达

✓ Keyboard Navigation

✓ Screen Reader 支持

✓ Model Availability Detection

✓ Download Progress

✓ Error Handling

✓ Local-first Privacy
```

---

# 44. v1.0 不实现

```text
× 自动分析整个网页

× 自动修改 alt

× 多图自动分析

× 图片差异比较

× Ask SeeMore

× 商品推荐

× 用户账号

× 云端模型

× 数据同步

× 移动端
```

控制 MVP 的复杂度非常重要。

---

# 45. v1.1

加入：

```text
Product Gallery Detection

上一张 / 下一张

图片 1 / N

图片类型识别

正面 / 背面 / 侧面 / 细节
```

---

# 46. v1.2

加入：

**Multi-image Understanding**

能够回答：

> 这几张商品图片分别展示什么？

并自动总结新增视觉信息。

---

# 47. v1.3

加入：

**Ask SeeMore**

用户可以自然语言询问图片。

---

# 48. v2.0

SeeMore 从：

> Product Image Description

升级为：

> Product Visual Understanding

支持完整商品视觉总结：

```text
商品
├── 基础视觉
├── 颜色
├── 结构
├── 版型
├── 设计细节
├── 正面
├── 侧面
├── 背面
├── 特写
└── 场景
```

---

# 49. 后续扩展方向

SeeMore 的架构不应限制在电商。

未来可以扩展：

```text
SeeMore Shopping

SeeMore Image

SeeMore Chart

SeeMore Document

SeeMore Social
```

例如：

### 社交媒体

解释：

```text
Instagram
X
Reddit
```

中的图片。

### 新闻

描述新闻图片中的：

人物、场景和视觉信息。

### 图表

将：

```text
Chart
Graph
Infographic
```

转换为结构化数据说明。

---

# 50. 成功指标

SeeMore 不应该只关注：

> AI 描述生成次数

更加重要的是描述是否真的有帮助。

核心指标：

### AI Task Success Rate

成功完成识别：

> ≥ 95%

### User Retry Rate

由于结果无效而重新生成的比例。

### Visual Detail Coverage

测试商品集中的关键视觉属性覆盖率。

### Hallucination Rate

出现错误事实推断的比例。

这个指标需要重点控制。

### Accessibility Task Completion

视障用户能否仅依赖键盘 + Screen Reader：

```text
打开 SeeMore
↓
分析图片
↓
查看描述
↓
切换信息
↓
完成操作
```

---

# 51. AI Eval

SeeMore 必须建立自己的 Visual Accessibility Eval Dataset。

例如收集：

```text
100 Clothing Images
50 Shoes
50 Bags
50 Accessories
```

人工建立 Ground Truth：

```text
颜色
结构
长度
图案
细节
视角
新增信息
```

然后评估：

```text
Attribute Recall

Attribute Accuracy

Hallucination Rate

Uncertainty Accuracy

Description Usefulness
```

不能简单依赖：

> 看起来 AI 描述得不错。

---

# 52. Accessibility Eval

至少测试：

```text
Chrome + NVDA

Chrome + VoiceOver

Keyboard Only

200% Zoom

High Contrast

Reduced Motion
```

完整流程不得依赖鼠标。

---

# 53. 产品核心差异

传统：

```text
IMAGE
↓
CAPTION
↓
"A woman wearing a black dress."
```

SeeMore：

```text
IMAGE
+
PRODUCT CONTEXT
+
OTHER IMAGES
        ↓
PRODUCT VISUAL UNDERSTANDING
        ↓
视觉结构
+
视觉细节
+
穿着效果
+
多图差异
+
不确定信息
        ↓
Accessible Product Knowledge
```

---

# 54. 项目定位

SeeMore 不是：

**AI Alt Generator**

而是：

## AI Visual Accessibility Assistant

更准确地说：

## Product Visual Understanding for Accessibility

---

# 55. 开源策略

Repository：

```text
seemore
```

License：

```text
Apache License 2.0
```

项目原则：

```text
Open Source
Local First
Privacy First
Accessibility First
AI Assisted
```

README License：

```text
SeeMore is licensed under the Apache License 2.0.

Copyright © 2026 SeeMore Contributors
```

---

# 56. 最终产品定义

SeeMore 的核心价值可以浓缩成一句话：

> **将原本只能通过视觉获取的商品信息，转换成视障用户能够查询、理解和使用的信息。**

技术实现只是：

```text
Chrome Extension
+
Built-in AI
+
Multimodal
+
Accessibility
```

真正的产品目标是：

> **缩小视觉用户与非视觉用户在电商购物过程中能够获得的信息差距。**

这也是 SeeMore 后续所有功能是否值得开发的判断标准。