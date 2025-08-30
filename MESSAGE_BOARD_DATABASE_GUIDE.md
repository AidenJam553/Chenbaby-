# 留言板回复功能数据库配置指南

## 📋 概述

本指南详细说明了留言板回复功能的数据库配置，包括表结构、索引、函数和视图的设置。

## 🗄️ 数据库表结构

### Messages 表更新

```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  reply_to BIGINT REFERENCES messages(id) ON DELETE CASCADE,  -- 🆕 回复功能
  is_pinned BOOLEAN DEFAULT FALSE,                            -- 🆕 置顶功能
  emoji_reactions JSONB DEFAULT '{}',                         -- 🆕 表情反应
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()           -- 🆕 更新时间
);
```

### 关键字段说明

- `reply_to`: 指向父留言的ID，NULL表示主留言，非NULL表示回复
- `is_pinned`: 是否置顶显示
- `emoji_reactions`: JSON格式存储表情反应统计
- `updated_at`: 自动更新的时间戳

## 📊 索引优化

### 核心索引
```sql
-- 基础索引
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_reply_to ON messages(reply_to);
CREATE INDEX idx_messages_is_pinned ON messages(is_pinned);

-- 复合索引（回复功能优化）
CREATE INDEX idx_messages_reply_created ON messages(reply_to, created_at) WHERE reply_to IS NOT NULL;
CREATE INDEX idx_messages_main_created ON messages(created_at DESC) WHERE reply_to IS NULL;
```

### 索引用途
- `idx_messages_reply_to`: 快速查找特定留言的回复
- `idx_messages_reply_created`: 优化回复按时间排序
- `idx_messages_main_created`: 优化主留言列表查询

## 🔧 数据库函数

### 1. 获取留言和回复 `get_messages_with_replies()`
```sql
-- 返回所有留言及其回复数量
SELECT * FROM get_messages_with_replies();
```

### 2. 获取特定留言的回复 `get_replies_for_message(parent_id)`
```sql
-- 获取ID为1的留言的所有回复
SELECT * FROM get_replies_for_message(1);
```

### 3. 获取留言树结构 `get_message_thread(message_id)`
```sql
-- 获取完整的留言对话树
SELECT * FROM get_message_thread(1);
```

### 4. 批量获取回复数量 `get_bulk_reply_counts(message_ids[])`
```sql
-- 批量获取多个留言的回复数量
SELECT * FROM get_bulk_reply_counts(ARRAY[1, 2, 3]);
```

### 5. 用户回复统计 `get_user_reply_stats(user_id)`
```sql
-- 获取用户的留言和回复统计
SELECT * FROM get_user_reply_stats(1);
```

### 6. 健康检查 `message_board_health_check()`
```sql
-- 检查留言板数据完整性
SELECT * FROM message_board_health_check();
```

## 📈 数据库视图

### 1. 留言板统计视图 `message_board_stats`
```sql
-- 按日期统计留言活动
SELECT * FROM message_board_stats;
```

显示内容：
- 每日留言总数
- 主留言数量
- 回复数量
- 总点赞数
- 平均点赞数
- 独立贡献者数量

### 2. 热门留言视图 `popular_messages`
```sql
-- 按热度排序的留言列表
SELECT * FROM popular_messages LIMIT 10;
```

热度计算公式：
```
热度分数 = 点赞数 + (回复数 × 0.5) + (时间衰减因子 × -0.1)
```

### 3. 用户统计视图 `user_stats`（已更新）
现在包含：
- 主留言数量
- 回复数量
- 总留言数量

## 🚀 部署步骤

### 1. 主数据库设置
```bash
# 在 Supabase SQL Editor 中执行
psql -f supabase_setup.sql
```

### 2. 回复功能迁移
```bash
# 执行回复功能专用迁移
psql -f message_board_reply_migration.sql
```

### 3. 存储策略设置
```bash
# 如果需要文件上传功能
psql -f storage_policies.sql
```

## 🔍 查询示例

### 获取留言板数据（前端使用）
```sql
-- 获取主留言列表（按置顶和时间排序）
SELECT 
    m.id,
    m.name,
    m.text,
    m.likes,
    m.emoji_reactions,
    m.created_at,
    COALESCE(r.reply_count, 0) as reply_count
FROM messages m
LEFT JOIN (
    SELECT reply_to, COUNT(*) as reply_count
    FROM messages 
    WHERE reply_to IS NOT NULL 
    GROUP BY reply_to
) r ON m.id = r.reply_to
WHERE m.reply_to IS NULL
ORDER BY m.is_pinned DESC, m.created_at DESC;

-- 获取特定留言的回复
SELECT *
FROM messages
WHERE reply_to = $1
ORDER BY created_at ASC;
```

### 添加回复
```sql
INSERT INTO messages (name, text, user_id, reply_to)
VALUES ($1, $2, $3, $4)
RETURNING *;
```

### 更新点赞数
```sql
UPDATE messages 
SET likes = likes + 1, updated_at = NOW()
WHERE id = $1
RETURNING *;
```

## 🛠️ 维护任务

### 定期清理
```sql
-- 清理孤立回复
SELECT cleanup_orphaned_replies();

-- 健康检查
SELECT * FROM message_board_health_check();
```

### 性能监控
```sql
-- 检查索引使用情况
SELECT 
    tablename,
    indexname,
    idx_scan,
    idx_tup_read
FROM pg_stat_user_indexes 
WHERE tablename = 'messages'
ORDER BY idx_scan DESC;
```

## 📝 应用层集成

### API 端点建议
```javascript
// 获取留言列表
GET /api/messages
// 返回：主留言 + 回复数量

// 获取特定留言的回复
GET /api/messages/:id/replies
// 返回：该留言的所有回复

// 添加回复
POST /api/messages/:id/replies
// 请求体：{ name, text, user_id }

// 点赞留言/回复
POST /api/messages/:id/like
```

### 前端状态管理
```javascript
// 建议的数据结构
{
  messages: [
    {
      id: 1,
      name: "用户名",
      text: "留言内容",
      likes: 5,
      reply_count: 3,
      replies: [], // 展开时加载
      is_expanded: false
    }
  ]
}
```

## 🔒 安全考虑

### Row Level Security (RLS)
当前配置允许公共访问，生产环境建议：

```sql
-- 更严格的 RLS 策略示例
CREATE POLICY "Users can only edit own messages" 
ON messages FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can only delete own messages" 
ON messages FOR DELETE 
USING (user_id = auth.uid());
```

### 数据验证
- 回复内容长度限制：500字符
- 回复层级限制：最多10层（防止无限递归）
- 表情反应验证：仅允许预定义的表情符号

## 📞 技术支持

如有问题，请检查：
1. 数据库连接配置
2. 表和索引是否正确创建
3. 权限策略是否正确设置
4. 函数和视图是否成功创建

执行健康检查获取系统状态：
```sql
SELECT * FROM message_board_health_check();
```
