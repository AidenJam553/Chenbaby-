# 小琛的温馨小屋 💕

一个温馨的情侣小站，记录互动与回忆。

## 功能特性

- 💬 **留言板**：留下心里话，分享美好时光
- 📸 **相册**：记录每一个精彩瞬间
- ❓ **你问我答**：有趣的互动问答，增进了解
- 📱 **响应式设计**：完美适配手机端
- 🎨 **温馨界面**：粉色系配色，可爱动效

## 技术栈

- **前端**：React + Vite + Framer Motion
- **后端**：Supabase (PostgreSQL + 存储)
- **样式**：CSS3 + 响应式设计
- **部署**：Vercel/Netlify

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件并添加以下配置：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中运行以下 SQL 创建表：

```sql
-- 消息表
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 照片表
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  tag VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 问答表
CREATE TABLE qa_pairs (
  id SERIAL PRIMARY KEY,
  q TEXT NOT NULL,
  a TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. 创建存储桶 `photos` 用于存储图片
4. 设置存储桶权限为公开读取

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看效果

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 自定义域名

在 Vercel 项目设置中添加自定义域名即可。

## 项目结构

```
src/
├── components/     # 可复用组件
├── pages/         # 页面组件
├── styles/        # 样式文件
├── utils/         # 工具函数
└── App.jsx        # 主应用组件
```

## 自定义配置

### 修改主题色

在 `src/styles/index.css` 中修改 CSS 变量：

```css
:root {
  --primary-pink: #FF6B9D;  /* 主色调 */
  --light-pink: #FFB3D1;    /* 浅粉色 */
  --mint-green: #A8E6CF;    /* 薄荷绿 */
}
```

### 添加新功能

1. 在 `src/pages/` 创建新页面
2. 在 `src/App.jsx` 添加路由
3. 在 `src/components/Navigation.jsx` 添加导航项

## 许可证

MIT License

---

💝 希望这个小站能成为你们美好回忆的见证者！
