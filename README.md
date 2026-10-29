# Felix Wang — Personal portfolio

A portable, dependency-free static portfolio for Felix (Jiandi) Wang.

- Website: https://wjddidi-1.github.io/
- Source: https://github.com/WJDdidi-1/wjddidi-1.github.io
- No build service, database, API key or paid subscription required for the site code.
- No remote fonts, third-party scripts, analytics or externally loaded images.

## Files

- `index.html`: main portfolio and project content.
- `profile.html`: concise profile with print-friendly styling.
- `styles.css`: responsive layouts, typography and colours.
- `script.js`: optional project filtering. All project content remains available without JavaScript.
- `assets/`: local illustration and favicon.
- `.nojekyll`: serve the static files without Jekyll processing.

## 本地预览

在网站文件夹内运行：

```sh
python3 -m http.server 8765
```

然后打开 http://localhost:8765 。结束预览按 Ctrl+C。部署后的 GitHub Pages 不需要电脑开机。

## 更新网站

1. 在 GitHub 仓库里编辑 `index.html`，或在本地修改后提交到 `main`。
2. 提交时只上传网站文件。不要上传原始简历、申请材料、个人证件、账号配置或密钥。
3. GitHub Pages 设置为 **Deploy from a branch → main → /(root)**。
4. 查看仓库 Actions / Deployments 中的 Pages 发布状态，再打开正式网址确认。

项目介绍应反映实际状态，研究兴趣不等于已完成成果。不要从旧简历直接复制未经核实的日期、性能数字或任职信息。

## 长期保留与迁移

- GitHub 仓库保留源码和修改历史；定期下载 ZIP，并在电脑之外保留一份备份。
- 本地完整文件可以直接打开，或放到任何静态网站托管服务上。
- 迁移时复制 HTML、CSS、JS 和 assets 即可，无需重建应用。
- 若更换网址，更新 `index.html` 的 canonical / og:url、`sitemap.xml` 和 `robots.txt`。
- `github.io` 地址由 GitHub 提供，持续可用取决于账号、仓库和平台政策，不是永久性保证。
- 自有域名可把网址与平台分开，但需要购买和持续续费；本版本没有购买或绑定域名。

## Privacy and content

This repository contains only the curated website. Professional contact email and public project links are included; private correspondence, phone numbers, addresses, original application documents and confidential materials are excluded. The illustration is conceptual, not a photograph of deployed hardware. Project source links are provided for inspection, not as a claim that every planned feature is complete.
