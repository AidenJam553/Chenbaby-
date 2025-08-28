# 数据库连接配置指南 🔧

## 问题诊断

您的网站目前使用的是模拟数据，而不是真实的Supabase数据库。这是因为：

1. ✅ **已修复**：`src/utils/supabase.js` 中的强制模拟数据设置
2. ❌ **需要配置**：Supabase环境变量未设置

## 解决步骤

### 第1步：获取Supabase配置信息

1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目（如果没有项目，需要先创建一个）
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL**（项目URL）
   - **anon public key**（匿名公钥）

### 第2步：本地开发配置

在项目根目录创建 `.env` 文件：

```bash
# 复制 env.example 文件
cp env.example .env
```

然后编辑 `.env` 文件，填入真实的Supabase配置：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 第3步：Vercel部署配置

由于您的网站已部署到Vercel，需要在Vercel中设置环境变量：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 `chenbaby`
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: 您的Supabase项目URL
   
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: 您的Supabase匿名密钥

5. 点击 **Save** 保存
6. 重新部署项目（或推送新的代码触发自动部署）

### 第4步：设置Supabase数据库

在Supabase SQL Editor中运行以下SQL脚本：

1. **创建数据库结构**：
   ```sql
   -- 在 SQL Editor 中运行
   \i supabase_setup.sql
   ```

2. **配置存储策略**：
   ```sql
   -- 在 SQL Editor 中运行  
   \i storage_policies.sql
   ```

## 验证连接

配置完成后，您可以通过以下方式验证连接：

### 1. 浏览器控制台检查
打开网站，按F12查看控制台，应该看到：
```
Supabase 配置信息:
URL: https://your-project-id.supabase.co
Key 长度: 192
是否已配置: true
```

### 2. 功能测试
- 尝试登录（用户名：chenchen，密码：chenbao123）
- 发表留言
- 上传照片
- 创建问答

### 3. 数据库验证
在Supabase Dashboard的Table Editor中查看是否有数据写入。

## 常见问题解决

### 问题1：环境变量不生效
**解决方案**：
- 确保 `.env` 文件在项目根目录
- 重启开发服务器 `npm run dev`
- 检查环境变量名称是否正确（必须以`VITE_`开头）

### 问题2：连接超时或权限错误
**解决方案**：
- 检查Supabase项目是否暂停（免费版长时间不使用会暂停）
- 确认API密钥是`anon`类型，不是`service_role`
- 检查RLS（行级安全）策略是否正确配置

### 问题3：Vercel部署后仍然是模拟数据
**解决方案**：
- 确认Vercel环境变量设置正确
- 检查是否选择了正确的环境（Production）
- 重新部署项目

## 当前状态检查

✅ **已完成的修复**：
- 移除了强制使用模拟数据的设置
- 优化了数据库结构
- 创建了完整的存储策略

❌ **需要您完成**：
- 创建或确认Supabase项目
- 设置环境变量（本地 + Vercel）
- 运行数据库初始化脚本

## 技术支持

如果遇到问题，可以：
1. 检查浏览器控制台的错误信息
2. 查看Supabase Dashboard的日志
3. 确认网络连接和防火墙设置

完成这些步骤后，您的网站就能正常连接到Supabase数据库了！🎉
