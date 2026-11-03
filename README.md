# MoJin Insights

mojin.store 站点源码 —— 卫生 / 医疗 / 环保 领域的国际议题研究平台。

## 技术栈

- **Next.js 16**（App Router，`output: "export"` 静态导出）
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Three.js** + globe.gl（3D 地球）
- **ECharts**（图表）
- **Lenis** + **GSAP**（动效）

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4000
```

## 构建

```bash
npm run build    # 产物在 out/
```

## 部署

Cloudflare Pages 自动部署：

| 配置项 | 值 |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Production branch | `main` |

推送到 `main` 即自动部署到 https://mojin.store

## 页面

| 路径 | 说明 |
|---|---|
| `/` | 首页（3D 地球 + 议题 + 数据 + 方法） |
| `/about` | 公司介绍、能力、原则 |
| `/contact` | 联系方式与咨询表单 |
| `/insights` | 议题洞察列表 |
| `/reports` | 研究报告库 |

## 历史

旧版电商站点（HTML/CSS/JS + 商品上架工具链）已归档，
见 `w0odst0ck/mojin-store` 仓库的 `archive/独立站-2026-11/`。
