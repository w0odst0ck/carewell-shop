# 产品上传指南（运营专用）

> 面向非技术人员。你只需要编辑一个 CSV 文件，网站产品就会自动更新，不需要碰代码。

## 完整流程（三步）

1. **改 CSV**：复制 `products.example.csv` 为 `products.csv`（或直接编辑它），按下面格式填写/修改产品行。
2. **放图片**：把产品图片放进 `images/` 文件夹（要求见下文）。
3. **上传**：把 `products.csv` 和图片 `git push` 到 `gh-pages` 分支。

push 之后 GitHub Actions 会自动：
- 运行 `scripts/gen-products.js` 校验 CSV → 重新生成 `data/products.js` → 提交回仓库；
- GitHub Pages 自动部署新版本。约 1~2 分钟后网站生效。

> **检查结果**：到仓库的 Actions 页面看最新的 workflow 是否绿色 ✅。红色 ❌ 表示 CSV 有错，点进去看错误信息，改好后再 push 一次即可。

## CSV 格式

- 文件必须是 **UTF-8 编码**（Excel 另存为时选 "CSV UTF-8"）。
- 第一行是表头（英文，不要改），之后每行一个产品。
- 列之间用逗号分隔；**字段里含逗号时必须用双引号包起来**（见下方示例）。

| 列名 | 必填 | 说明 |
|---|---|---|
| `sku` | ✅ | 产品唯一编号，只允许**小写字母、数字、连字符**（如 `face-mask`）。重复会报错 |
| `name_en` / `name_cn` / `name_ar` | ✅ | 三种语言的产品名 |
| `sub_en` / `sub_cn` / `sub_ar` | | 副标题/简短描述（可留空） |
| `cat_en` / `cat_cn` / `cat_ar` | | 分类名（英文/中文/阿拉伯文） |
| `desc_en` / `desc_cn` / `desc_ar` | ✅ | 产品描述。多段用 `\|` 分隔，每段会显示为一个小标题（h4） |
| `price` | ✅ | 售价，数字，必须大于 0（如 `45` 或 `12.5`） |
| `old_price` | | 划线原价（促销用），可留空 |
| `unit` | | 计价单位（如 `/ 10 pcs`、`/ 50 pcs`） |
| `sale` | | 促销标签（如 `-18%`），可留空 |
| `rating` | | 评分 0–5，留空默认 `4.5` |
| `reviews` | | 评价数量，留空默认 `0` |
| `sizes` | | 尺码，逗号分隔（含逗号，**必须加引号**，如 `"M,L,XL"`） |
| `colors` | | 颜色，逗号分隔（同上，如 `"Blue,White"`） |
| `image` | ✅ | 图片文件名（见下方图片要求） |
| `status` | | 上下架：`active`=上架（默认）/ `hidden`=下架（不出现在网站但数据保留）。留空=`active`；非法值报错 |

### 示例行

```
sku,name_en,price,sizes,colors,image,status
face-mask,Disposable Face Mask (50 pcs),12.5,"M,L,XL","White,Blue",images/face-mask.webp,active
```

## 图片要求

- 格式：**`.webp`**（不接受 jpg/png——中文/其他格式会被拒绝）
- 大小：**小于 100KB**（可用 tinypng、squoosh 等在线工具压缩）
- 文件名：**只允许英文、数字、连字符 `-`、下划线 `_`**（如 `face-mask.webp`），不能有中文或空格
- 位置：放进 `images/` 文件夹；CSV 的 `image` 列写 `images/文件名.webp`

## 上下架 = 改一个词

- **上架**：把该行的 `status` 设为 `active`（或留空，默认就是上架）。
- **下架**：把 `status` 改成 `hidden`。**不要删行**——删行会丢数据，hidden 只是让商品不出现在网站上，数据、图片都完整保留，随时改回 `active` 即可重新上架。

## 常见错误（workflow 报红时对照）

| 错误提示 | 原因 / 解决 |
|---|---|
| `SKU 'xxx' 只允许小写字母、数字和连字符` | sku 里有大写或符号，改成小写+连字符 |
| `SKU 'xxx' 重复` | 两个产品用了同一个 sku，改成不同编号 |
| `字段 name_en 不能为空` / `desc_ar ...` | 必填列留空了，补上 |
| `price 必须是大于 0 的数字` | 价格没填或填了非数字 |
| `图片文件名 '手工医生帽.jpg' 只能包含英文...` | 文件名有中文，重命名图片为英文 |
| `图片 xxx 不是 webp 格式` | 用了 jpg/png，转成 webp |
| `图片 images/xxx.webp 在 images/ 目录下不存在` | 文件名写错，或图片忘了放进 images/ 并一起 push |
| `status 必须是 active 或 hidden` | status 填了 active/hidden 以外的值，改成 `active` 或 `hidden`（或留空） |

## 本地测试（可选，给懂命令行的人）

```bash
# 校验 CSV 并生成（输出到临时文件，不覆盖正式数据）
node scripts/gen-products.js products.example.csv /tmp/test-products.js
# 正式生成
node scripts/gen-products.js products.csv data/products.js
```
