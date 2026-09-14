# shadcn / Registry 参考资料

> 基于 2026-09 的 shadcn CLI **4.21.0** 实测整理。命令与字段均经过真实验证，不是从记忆里抄的。

---

## 一、CLI 命令速查

### 1.1 `init` / `create` —— 初始化项目

```bash
npx shadcn@latest init [components...]
```

实测帮助输出（`npx shadcn@latest init --help`）：

```
Options:
  -t, --template <template>  the template to use. (next, start, vite, react-router, laravel, astro)
  -b, --base <base>          the component library to use. (base, radix, aria)
  -p, --preset [name]        use a preset configuration
  -y, --yes                  skip confirmation prompt. (default: true)
  -d, --defaults             use default configuration: --template=next --preset=base-nova
  -f, --force                force overwrite of existing configuration.
  -c, --cwd <cwd>            the working directory. defaults to the current directory.
  -n, --name <name>          the name for the new project.
  -s, --silent               mute output.
  --css-variables            use css variables for theming. (default: true)
  --no-css-variables         do not use css variables for theming.
  --rtl                      enable RTL support.
  --pointer                  enable pointer cursor for buttons.
  --monorepo                 scaffold a monorepo project.
  --reinstall                re-install existing UI components.
  -h, --help                 display help for command
```

**TanStack Start 项目**：

```bash
npx shadcn@latest init --template start --base radix --css-variables
```

**⚠️ 关键坑（实测）**：`-y/--yes` **只跳过最终确认**，不跳过中间的交互式问卷
（会依次问 TypeScript? → style? → base color? → CSS variables?）。
无 TTY 环境下会直接卡死。详见 [踩坑记录 §2](02-踩坑与决策记录.md)。

**可用 preset**（实测报错信息里列出的完整清单）：

```
nova, vega, maia, lyra, mira, luma, sera, rhea
```

> 注意：`-d/--defaults` 的展开值是 `--preset=base-nova`，但直接传 `-p base-nova` 会报
> `Invalid preset: base-nova`。可用 preset 名就是上面 8 个裸名。

---

### 1.2 `add` —— 安装组件

```bash
npx shadcn@latest add [components...]
```

实测帮助输出：

```
Arguments:
  components         item addresses to add

Options:
  -y, --yes          skip confirmation prompt. (default: false)
  -o, --overwrite    overwrite existing files. (default: false)
  -c, --cwd <cwd>    the working directory. defaults to the current directory.
  -a, --all          add all available components (default: false)
  -p, --path <path>  the path to add the component to.
  -s, --silent       mute output. (default: false)
  --dry-run          preview changes without writing files. (default: false)
  --diff [path]      show diff for a file.
  --view [path]      show file contents.
  -h, --help         display help for command
```

**`components` 参数接受的四种形式**：

| 形式 | 示例 |
|---|---|
| 裸名（默认 registry） | `button` |
| 命名空间简写 | `@neobrutalism-base/button` |
| 完整 URL | `https://neobrutalism.com/r/base/button.json` |
| 本地路径 | `./my-component.json` |

**常用组合**：

```bash
# 预演，不落盘
npx shadcn@latest add @neobrutalism-base/card --dry-run

# 一次性装多个
npx shadcn@latest add badge card dialog --yes

# 上游更新后同步（⚠️ 会覆盖你的本地定制）
npx shadcn@latest add @neobrutalism-base/button --overwrite

# 对比差异
npx shadcn@latest add @neobrutalism-base/button --diff
```

**`--dry-run` 的实际输出**：

```
┌ shadcn add @neobrutalism-base/button (dry run)
│
├ Files (1) +1 new
│ + src/components/ui/button.tsx  create
│
├ Dependencies (2)
│ + @base-ui/react
│ + class-variance-authority
│
│ 1 file, 2 deps
│
│ Run with --diff to view changes.
│ Run with --view to view file contents.
└ Run without --dry-run to apply.
```

---

### 1.3 `view` —— 看源码不安装

```bash
npx shadcn@latest view <items...>

# 示例
npx shadcn@latest view @neobrutalism-base/dialog
npx shadcn@latest view button card dialog
```

---

### 1.4 `search` / `list` —— 搜索 registry

```bash
npx shadcn@latest search|list [options] <registries...>

Options:
  -q, --query <query>    查询字符串
  -l, --limit <number>   每个 registry 显示的最大数量（默认 100）
  -o, --offset <number>  跳过的项目数量
```

```bash
npx shadcn@latest search @neobrutalism
npx shadcn@latest search @neobrutalism -q "button"
npx shadcn@latest list @neobrutalism
```

---

### 1.5 `build` —— 构建自己的 registry

```bash
npx shadcn@latest build [registry.json]

Options:
  -o, --output <path>  JSON 输出目录（默认 ./public/r）
```

读 `registry.json`，在 `public/r/` 生成每个 item 的 JSON。这是自建 design system 分发的关键命令。

---

### 1.6 关于 `diff`

**当前版本（CLI 4.21.0）没有独立的 `shadcn diff` 顶层命令**，它已经并入 `add` 的选项：
`add <component> --diff [path]`。

历史沿革（来自 v3 变更日志）：`diff` 曾作为 experimental 命令独立存在，用于列出
「本地组件 vs 上游最新版」的差异清单：

```
The following components have updates available:
- button
  - /path/to/my-app/components/ui/button.tsx
```

现在要达成同样目的，用 `add --diff`。

---

### 1.7 其他命令

| 命令 | 作用 |
|---|---|
| `shadcn docs [component]` | 拉取组件的文档和 API 参考 |
| `shadcn info` | 获取当前项目信息（`--json` 可脚本化） |
| `shadcn mcp init --client claude` | 把 shadcn 注册成 MCP 服务器给 AI 编辑器用 |
| `shadcn migrate cn` | 把 `clsx` + `tailwind-merge` 迁移到 `cn` |
| `shadcn migrate icons --from lucide --to phosphor` | 换图标库 |
| `shadcn migrate rtl` | 把物理 CSS 属性转逻辑属性（`ml-4` → `ms-4`） |
| `shadcn eject` | 把 `shadcn/tailwind.css` 内联进项目（不可逆） |

---

## 二、Registry 协议

### 2.1 核心认知

**Registry 不是包管理，是源码分发协议。**

```
npm 依赖:   pnpm add neobrutalism → 代码在 node_modules → 你不能改（改了会被覆盖）
Registry:   shadcn add @nb/button → 代码在 src/components/ui → 归你所有，随便改
```

代价是上游更新需要你手动同步（`--diff` + `--overwrite`）。

### 2.2 URL 约定

shadcn 官方和第三方 registry 都遵循这个模式：

```
{registry-base-url}/{component-name}.json
```

- shadcn 官方：`https://ui.shadcn.com/r/{name}.json`
- neobrutalism：`https://neobrutalism.com/r/{base|radix}/{name}.json`
- 目录索引：`https://neobrutalism.com/r/registry.json`（列出全部 item）

在 `components.json` 里登记命名空间后：

```json
{
  "registries": {
    "@neobrutalism": "https://neobrutalism.com/r/radix/{name}.json",
    "@neobrutalism-base": "https://neobrutalism.com/r/base/{name}.json"
  }
}
```

`{name}` 会被替换成组件名：`@neobrutalism-base/button` → `.../r/base/button.json`。

**带认证的 registry**：

```json
{
  "registries": {
    "@private": {
      "url": "https://api.company.com/registry/{name}.json",
      "headers": { "Authorization": "Bearer ${REGISTRY_TOKEN}" }
    }
  }
}
```

`${VAR}` 会从环境变量自动展开。

### 2.3 `registry-item.json` 字段全表

单个组件的 schema。neobrutalism 实际返回的样子（以 `base/button.json` 为例，content 截断）：

```json
{
  "name": "button",
  "type": "registry:ui",
  "dependencies": ["@base-ui/react", "class-variance-authority"],
  "files": [
    {
      "path": "button.tsx",
      "content": "import { Button as ButtonPrimitive } from \"@base-ui/react/button\"...",
      "type": "registry:ui",
      "target": "components/ui/button.tsx"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `$schema` | string | `https://ui.shadcn.com/schema/registry-item.json` |
| `name` | string | **必需**。item 标识，registry 内唯一 |
| `type` | string | **必需**。决定目标目录与语义，见下表 |
| `title` | string | 可读标题 |
| `description` | string | 详细描述 |
| `author` | string | 推荐格式 `username <url>` |
| `dependencies` | string[] | npm 包依赖，支持 `@version` 后缀，CLI 自动安装 |
| `devDependencies` | string[] | 开发期依赖 |
| `registryDependencies` | string[] | 其他 registry item，见下 |
| `files` | object[] | **主载荷**。每个含 `path` / `type` / `target` / `content` |
| `files[].path` | string | registry 内部路径 |
| `files[].type` | string | 文件类型（同 type 表，无 `registry:font`） |
| `files[].target` | string | **落点路径**。`registry:page` / `registry:file` 必需 |
| `files[].content` | string | 源码正文（build 时填充） |
| `cssVars` | object | `{ theme, light, dark }`，会合并进你的 CSS |
| `css` | object | 额外 CSS 规则（`@layer base` / `@keyframes` / `@utility`） |
| `envVars` | object | 环境变量（仅开发用，**已有变量不覆盖**） |
| `font` | object | 字体配置（`registry:font` 必需） |
| `docs` | string | 安装时 CLI 展示的 markdown 提示 |
| `categories` | string[] | 分类标签 |
| `meta` | object | 任意元数据 |

**`registryDependencies` 的五种写法**：

| 写法 | 类型 | 示例 |
|---|---|---|
| 裸名 | shadcn 官方 | `"button"` |
| `@namespace/name` | 命名空间 registry | `"@acme/input-form"` |
| `owner/repo/name` | GitHub registry | `"acme/ui/button"`，可加 `#v1.2.0` |
| 完整 URL | 自定义 registry | `"https://example.com/r/editor.json"` |
| 相对路径 | 本地 registry | `"./editor.json"` |

> ⚠️ **踩坑点**：neobrutalism 的 `dialog.json` 里写的是裸名 `"button"`，会解析到 **shadcn 官方**
> 而非 neobrutalism。这就是[踩坑 1](02-踩坑与决策记录.md) 的根因。

**`target` 的占位符**（只在开头生效）：

| 占位符 | 解析成 |
|---|---|
| `@components/` | `aliases.components` |
| `@ui/` | `aliases.ui` |
| `@lib/` | `aliases.lib` |
| `@hooks/` | `aliases.hooks` |
| `~` | 项目根 |
| `@utils/` | **不支持**（utils 指向文件而非目录） |

### 2.4 `type` 的 12 种合法取值

| type | 用途 |
|---|---|
| `registry:ui` | UI 基元组件 → `components/ui/`。**本项目的 21 个全是这个** |
| `registry:component` | 业务组件 → `components/` |
| `registry:block` | 多文件组成的完整区块 |
| `registry:lib` | 工具函数 / 库代码 |
| `registry:hook` | React Hook |
| `registry:theme` | 整套主题（CSS 变量） |
| `registry:style` | 样式预设（如 new-york） |
| `registry:page` | 完整页面 / 路由 |
| `registry:file` | 任意文件 |
| `registry:base` | 整个设计系统 |
| `registry:font` | 字体 |
| `registry:item` | 通用 item |

### 2.5 `registry.json` 顶层结构

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "my-registry",
  "homepage": "https://example.com",
  "items": [ /* 一堆 registry-item */ ]
}
```

| 字段 | 说明 |
|---|---|
| `name` | registry 名称，**仅根 registry.json 必需** |
| `homepage` | 主页，**仅根 registry.json 必需** |
| `include` | 用其他 registry.json 组合（路径必须指向显式 `registry.json`，不支持目录简写） |
| `items` | item 数组，与 `include` 至少要有一个 |

**item 名称在整个（含 include 的）registry 里必须唯一。**

### 2.6 自建 registry 的最简流程

```bash
# 1. 在项目根写 registry.json
cat > registry.json <<'EOF'
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "my-design-system",
  "homepage": "https://example.com",
  "items": [
    {
      "name": "type-badge",
      "type": "registry:ui",
      "title": "TypeBadge",
      "description": "宝可梦属性徽章",
      "dependencies": ["class-variance-authority"],
      "files": [
        { "path": "src/components/type-badge.tsx", "type": "registry:ui",
          "target": "@ui/type-badge.tsx" }
      ]
    }
  ]
}
EOF

# 2. 构建成 CLI 可消费的 JSON
npx shadcn@latest build
# → public/r/type-badge.json

# 3. 部署 public/ 后，别人就能装你的组件
npx shadcn@latest add https://example.com/r/type-badge.json
```

**关键点**：协议唯一的要求是「registry 端点能返回符合 schema 的 JSON」。
Next.js / Vite / Vue / Svelte / PHP / 纯静态托管都可以。

### 2.7 动态路由托管（不用 build）

```ts
// app/r/[name].json/route.ts
import { loadRegistryItem, RegistryItemNotFoundError } from "shadcn/registry"

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params
  try {
    return Response.json(await loadRegistryItem(name))
  } catch (error) {
    if (error instanceof RegistryItemNotFoundError) {
      return Response.json({ error: `"${name}" not found` }, { status: 404 })
    }
    return Response.json({ error: "Failed to load" }, { status: 500 })
  }
}
```

需要 `pnpm add shadcn`。

---

## 三、components.json 字段全表

| 字段 | 本项目取值 | 说明 |
|---|---|---|
| `$schema` | `https://ui.shadcn.com/schema.json` | 编辑器补全用 |
| `style` | `"new-york"` | 组件风格。**初始化后无法更改**。`default` 已弃用 |
| `rsc` | `false` | 是否 React Server Components。TanStack Start **不是** |
| `tsx` | `true` | 生成 `.tsx`（false → `.jsx`） |
| `tailwind.config` | `""` | **Tailwind v4 必须留空** |
| `tailwind.css` | `"src/styles.css"` | 全局 CSS 入口，CSS 变量写这里 |
| `tailwind.baseColor` | `"neutral"` | 基础色板。**初始化后无法更改** |
| `tailwind.cssVariables` | `true` | 用 CSS 变量做主题。**初始化后无法更改** |
| `tailwind.prefix` | `""` | 类名前缀 |
| `aliases.components` | `"@/components"` | |
| `aliases.utils` | `"@/lib/utils"` | `cn()` 的导入路径 |
| `aliases.ui` | `"@/components/ui"` | **决定组件安装目录** |
| `aliases.lib` | `"@/lib"` | |
| `aliases.hooks` | `"@/hooks"` | |
| `iconLibrary` | `"lucide"` | neobrutalism 依赖 `lucide-react` |
| `registries` | 见 §2.2 | 第三方 registry 命名空间 |

**`baseColor` 的全部可选取值**：`neutral` / `stone` / `zinc` / `mauve` / `olive` / `mist` / `taupe`

**别名如何被解析**：CLI 读 `tsconfig.json` 的 `compilerOptions.paths`
（或 `package.json` 的 `imports`，需配合 `moduleResolution: "bundler"`）。

本项目 `tsconfig.json` 里已有：

```json
{
  "compilerOptions": {
    "paths": {
      "#/*": ["./src/*"],
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 四、Tailwind v4 主题写法

### 4.1 两层结构

```css
@import "tailwindcss";

/* 第一层：把 CSS 变量映射给 Tailwind，之后才能写 bg-primary 这类类名 */
@theme inline {
  --color-primary: var(--primary);
  --shadow-md: 4px 4px 0 0 var(--border);
  --radius: var(--radius);
}

/* 第二层：变量本身的值 */
:root {
  --primary: #ffdc58;
  --border: #000;
}

.dark {
  --primary: #ffdc58;
}
```

**为什么需要 `@theme inline`**：Tailwind v4 不再有 `tailwind.config.js`。
`@theme` 块就是配置本身。`inline` 关键字表示「值直接内联使用，不要包一层变量引用」——
不加 `inline` 时光标主题切换会失效。

### 4.2 圆角尺度派生

```css
@theme inline {
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}
```

neobrutalism 直接 `--radius: 0`，所有派生值都变成 0 → 全站直角。

### 4.3 语义 token 约定

成对的 `X` / `X-foreground`：

| Token 对 | 控制什么 | 用在哪 |
|---|---|---|
| `background` / `foreground` | 页面底 + 默认文本 | 页面壳 |
| `card` / `card-foreground` | 抬升表面 | Card 组件 |
| `popover` / `popover-foreground` | 浮层表面 | Popover / DropdownMenu |
| `primary` / `primary-foreground` | 高强调操作 | 默认 Button、选中态 |
| `secondary` / `secondary-foreground` | 低强调填充 | 次级按钮 |
| `muted` / `muted-foreground` | 柔和表面 / 弱化文本 | 描述文字、占位符 |
| `accent` / `accent-foreground` | 交互悬停态 | Ghost 按钮、菜单高亮 |
| `destructive` | 破坏性操作 | 危险按钮 |
| `border` / `input` / `ring` | 边框 / 输入框 / 焦点环 | |

### 4.4 新增自定义 token

```css
:root {
  --type-fire: #ff6b35;
}

@theme inline {
  --color-type-fire: var(--type-fire);
}
```

之后就能写 `bg-type-fire`、`text-type-fire`。

> 本项目更进一步：在 `type-chart.ts` 里导出 `TYPE_VARS`，用内联 `style` 动态注入 —— 
> 因为属性名是运行时变量，静态类名写不出来。

### 4.5 自定义工具类

```css
@utility bg-grid {
  background-image: linear-gradient(...);
  background-size: 28px 28px;
}
```

`@utility` 是 v4 新增指令，替代了 v3 的 `@layer utilities`。

---

## 五、neobrutalism registry 清单

**Registry 地址**：`https://neobrutalism.com/r/registry.json`
**版本**：v2.3（2026-07 从 RetroUI 改名，npm 包与 registry 路径未变）
**依赖**：`class-variance-authority` + `@base-ui/react`（base 版）或 `radix-ui`（radix 版）+ 部分组件 `lucide-react`
**字体**：`Archivo Black`（`--font-head`）+ `Space Grotesk`（`--font-sans`）

### 全部 54 个组件

```
accordion        alert            alert-dialog     aspect-ratio     avatar
badge            breadcrumb       button           button-group     calendar
card             carousel         checkbox         collapsible      combobox
command          context-menu     dialog           direction        drawer
dropdown-menu    empty            field            hover-card       input
input-group      input-otp        item             kbd              label
menubar          native-select    navigation-menu  pagination       popover
progress         radio-group      resizable        scroll-area      select
separator        sheet            sidebar          skeleton         slider
sonner           spinner          switch           table            tabs
textarea         toggle           toggle-group     tooltip
```

**本项目已装 21 个**（带 ★ 的）：

```
★ accordion      ★ alert         alert-dialog   aspect-ratio   ★ avatar
★ badge          breadcrumb      ★ button       button-group   calendar
★ card           carousel        ★ checkbox     collapsible    combobox
command          context-menu    ★ dialog       direction      drawer
★ dropdown-menu  empty           field          hover-card     ★ input
input-group      input-otp       item           kbd            ★ label
menubar          native-select   navigation-menu pagination    ★ popover
★ progress       radio-group     resizable      scroll-area    ★ select
★ separator      sheet           sidebar        ★ skeleton     slider
sonner           spinner         ★ switch       ★ table        ★ tabs
★ textarea       toggle          toggle-group   ★ tooltip
```

**还想要的组件**（`npx shadcn@latest add @neobrutalism-base/<name>`）：

| 组件 | 适合做什么 |
|---|---|
| `calendar` / `date-picker` | 「某天捕捉了哪些宝可梦」的日历视图 |
| `command` | `Cmd+K` 全局搜索宝可梦 |
| `carousel` | 宝可梦卡牌滑动展示 |
| `sonner` | 「已加入队伍」的 toast 提示 |
| `slider` | 按种族值区间筛选 |
| `sheet` / `drawer` | 移动端筛选面板 |
| `sidebar` | 桌面端侧边导航 |
| `chart`（需另找） | 种族值雷达图 |

---

## 六、MCP 集成（可选）

让 AI 编辑器直接查组件源码：

```bash
npx shadcn@latest mcp init --client claude
```

或手动写 `.mcp.json`：

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

配置后 AI 能做的事：
- 「显示 neobrutalism registry 里所有可用组件」
- 「把 dialog 组件加到我的项目」
- 「用 neobrutalism 的组件做一个登录表单」

**注意**：MCP 走的是 `components.json` 里配置的 registry。
neobrutalism 的完整 MCP 服务是 Pro 功能（需要 token）。

---

## 七、官方文档地址

**shadcn 中文站**（本项目主要参考）：

- 安装总览 — https://www.shadcn.com.cn/docs/installation
- CLI 命令 — https://www.shadcn.com.cn/docs/cli
- Registry 协议 — https://www.shadcn.com.cn/docs/registry
- registry.json schema — https://www.shadcn.com.cn/docs/registry/registry-json
- registry-item.json schema — https://www.shadcn.com.cn/docs/registry/registry-item-json
- 自建 registry 指南 — https://www.shadcn.com.cn/docs/registry/getting-started
- components.json — https://www.shadcn.com.cn/docs/components-json
- 主题 Theming — https://www.shadcn.com.cn/docs/theming
- 暗色模式 — https://www.shadcn.com.cn/docs/dark-mode
- MCP — https://www.shadcn.com.cn/docs/mcp
- Monorepo — https://www.shadcn.com.cn/docs/monorepo
- TanStack Start 安装 — https://www.shadcn.com.cn/docs/installation/tanstack
  （注意：`/installation/tanstack-start` 是 404，正确路径没有 `-start`）

**neobrutalism**：

- 中文文档首页 — https://neobrutalism.com/zh/docs
- 安装指南 — https://neobrutalism.com/zh/docs/installation
- 更新日志 — https://neobrutalism.com/zh/docs/changelog
- MCP 服务 — https://neobrutalism.com/zh/mcp
- registry 索引 — https://neobrutalism.com/r/registry.json
- 单组件（base） — https://neobrutalism.com/r/base/{name}.json
- 单组件（radix） — https://neobrutalism.com/r/radix/{name}.json

> neobrutalism **没有**独立的 `/zh/docs/theming` 和 `/zh/docs/cli` 页面（实测 404），
> 主题变量和 CLI 用法都写在 installation 页里。

**TanStack Start**：

- 官方文档 — https://tanstack.com/start
- CLI 脚手架 — `npx @tanstack/cli@latest create --help`
