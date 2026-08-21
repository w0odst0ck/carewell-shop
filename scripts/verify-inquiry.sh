#!/usr/bin/env bash
# =========================================================
# verify-inquiry.sh — 三语询盘页 fail-closed 验证（C1–C7）
# 任一检查失败 → 累计并最终 exit 1（无 --skip 类软开关）
# 设计参考：.flow/workitems/inquiry-page-productization/design.md §1.6
# =========================================================
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FILES=(inquiry-en.html inquiry-cn.html inquiry-ar.html)
FAIL=0

ok()   { echo "✅ $1"; }
fail() { echo "❌ $1"; FAIL=1; }

count() { # count <pattern> <file> — 统计匹配次数（按匹配数而非行数）
  grep -o -- "$1" "$2" 2>/dev/null | wc -l
}

# ---- C1 doctype/结构唯一：每文件各结构标签恰好 1 个 ----
for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    fail "C1 $f 不存在"
    continue
  fi
  bad=0
  for pat in '<!DOCTYPE html>' '<html' '<head>' '<body>' '<header>' 'id="mobileNav"'; do
    c=$(count "$pat" "$f")
    if [ "$c" -ne 1 ]; then
      fail "C1 $f: '$pat' 出现 $c 次（应为 1）"
      bad=1
    fi
  done
  [ "$bad" -eq 0 ] && ok "C1 $f doctype/结构唯一"
done

# ---- C2 样式引用：vars.css + inquiry.css ----
for f in "${FILES[@]}"; do
  if grep -q 'css/vars.css' "$f" && grep -q 'css/inquiry.css' "$f"; then
    ok "C2 $f 引用 css/vars.css + css/inquiry.css"
  else
    fail "C2 $f 缺少 css/vars.css 或 css/inquiry.css 引用"
  fi
done

# ---- C3 无内联残留：无 <style、无 style= ----
for f in "${FILES[@]}"; do
  if grep -qE '<style|style=' "$f"; then
    fail "C3 $f 存在 <style 或 style=（内联残留）"
  else
    ok "C3 $f 无内联 style 残留"
  fi
done

# ---- C4 结构一致：HTMLParser 归一化（tag + 排序属性名，忽略文本）三语全等 ----
if python3 - "$ROOT" <<'PY'
import sys
from html.parser import HTMLParser

root = sys.argv[1]
files = ["inquiry-en.html", "inquiry-cn.html", "inquiry-ar.html"]

class Norm(HTMLParser):
    """输出 `<tag 属性名...>`（tag 名 + 排序后的属性名 + class/id 属性值白名单），忽略文本/注释/实体。
    可译属性值（lang/dir/content/placeholder/option value/`<title>` 文本）不参与比较；
    class/id 是关键契约属性，值必须三语一致（防 class 漂移）。"""

    # 关键属性白名单：值参与跨语言一致性比较
    VALUE_ATTRS = ("class", "id")

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tokens = []

    def _tag(self, tag, attrs, close):
        keys = sorted(k for k, _ in attrs)
        inner = " " + " ".join(keys) if keys else ""
        # 关键属性值附加进 token（三语必须一致）
        for k, v in sorted(attrs):
            if k in self.VALUE_ATTRS:
                inner += f" {k}={v!r}"
        self.tokens.append(f"<{tag}{inner}{close}>")

    def handle_starttag(self, tag, attrs):
        self._tag(tag, attrs, "")

    def handle_startendtag(self, tag, attrs):
        self._tag(tag, attrs, "/")

    def handle_endtag(self, tag):
        self.tokens.append(f"</{tag}>")
    # handle_data / handle_comment / handle_entityref 未实现 → 文本被忽略

norms = []
for name in files:
    p = Norm()
    p.feed(open(f"{root}/{name}", encoding="utf-8").read())
    p.close()
    norms.append(p.tokens)

if norms[0] == norms[1] == norms[2]:
    print(f"✅ C4 三语结构归一化全等（{len(norms[0])} tokens）")
    sys.exit(0)

print("❌ C4 三语结构归一化不一致：")
for name, toks in zip(files, norms):
    print(f"   {name}: {len(toks)} tokens")
for i in range(max(map(len, norms))):
    cur = [n[i] if i < len(n) else "<缺失>" for n in norms]
    if cur[0] != cur[1] or cur[1] != cur[2]:
        print(f"   首个差异 @token[{i}]:")
        for name, tok in zip(files, cur):
            print(f"     {name}: {tok}")
        break
sys.exit(1)
PY
then
  :
else
  FAIL=1
fi

# ---- C5 AI 入口：planner-card + SITE_CONFIG.plannerUrl ----
for f in "${FILES[@]}"; do
  if grep -q 'class="planner-card"' "$f" && grep -q 'SITE_CONFIG.plannerUrl' "$f"; then
    ok "C5 $f planner-card + SITE_CONFIG.plannerUrl 引用存在"
  else
    fail "C5 $f 缺少 class=\"planner-card\" 或 SITE_CONFIG.plannerUrl"
  fi
done

# ---- C6 表单契约：inquiryForm 唯一 + 8 字段 id + form-group 数量 ----
IDS=(inquiryForm fCategory fQty fCustom fCompany fName fWa fEmail fMsg)
for f in "${FILES[@]}"; do
  miss=""
  for id in "${IDS[@]}"; do
    grep -q "id=\"$id\"" "$f" || miss="$miss $id"
  done
  # 唯一性：inquiryForm 恰好 1 个（重复 form 会破坏提交行为且 C4 不拦截）
  form_count=$(grep -c 'id="inquiryForm"' "$f")
  [ "$form_count" -eq 1 ] || miss="$miss inquiryForm×$form_count"
  # form-group 分组卡片恰好 3 组（产品需求/联系信息/补充说明）
  group_count=$(grep -c 'class="form-group"' "$f")
  [ "$group_count" -eq 3 ] || miss="$miss form-group×$group_count"
  if [ -z "$miss" ]; then
    ok "C6 $f 表单契约完整（inquiryForm 唯一 + 8 字段 + form-group×3）"
  else
    fail "C6 $f 违规:$miss"
  fi
done

# ---- C7 组件/焦点/响应式 ----
for f in "${FILES[@]}"; do
  miss=""
  for cls in form-group field-row btn-submit; do
    grep -q "class=\"$cls\"" "$f" || miss="$miss $cls"
  done
  if [ -z "$miss" ]; then
    ok "C7 $f 含 form-group / field-row / btn-submit"
  else
    fail "C7 $f 缺 class:$miss"
  fi
done
if grep -q ':focus-visible' css/inquiry.css && grep -q '@media' css/inquiry.css; then
  ok "C7 css/inquiry.css 含 :focus-visible 与 @media"
else
  fail "C7 css/inquiry.css 缺少 :focus-visible 或 @media"
fi

# ---- 汇总（fail-closed） ----
if [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "🎉 全部检查通过（exit 0）"
else
  echo ""
  echo "💥 存在失败项（exit 1）"
fi
exit "$FAIL"
