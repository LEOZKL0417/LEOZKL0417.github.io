# LEOZKL0417.github.io

基于 GitHub Pages 的个人主页，包含：

- 首页介绍（Hero）
- 关于我
- 项目展示
- 联系方式

## 本地文件

- `index.html`：页面结构
- `style.css`：样式与响应式布局
- `script.js`：滚动显现动画与年份
- `interesting.html`：有意思内容列表页
- `interesting-detail.html`：单条内容详情页
- `interesting-data.js`：内容数据源（新增条目改这里）
- `interesting.js`：列表渲染与详情渲染逻辑

## 如何新增一条 paper / video / note

在 `interesting-data.js` 里新增一个对象，字段如下：

```js
{
  id: "unique-id",
  type: "paper", // "paper" | "video" | "note"
  tag: "RAG",
  date: "2026-03-09",
  title: "条目标题",
  source: "arXiv",
  sourceUrl: "https://arxiv.org/",
  summary: "你自己的摘要",
  thoughts: "你自己的想法"
}
```

说明：

- `id` 必须唯一，用于详情页链接
- `date` 用 `YYYY-MM-DD`
- `summary` 和 `thoughts` 会显示在详情页的两个独立板块

## 发布到 GitHub Pages

1. 确认仓库名是 `LEOZKL0417.github.io`
2. 提交并推送到 `main` 分支
3. 在仓库 `Settings -> Pages` 里确认：
   - Source: `Deploy from a branch`
   - Branch: `main`，Folder: `/ (root)`
4. 访问：`https://LEOZKL0417.github.io`

## 快速提交命令

```bash
git add .
git commit -m "feat: add personal homepage"
git push origin main
```
