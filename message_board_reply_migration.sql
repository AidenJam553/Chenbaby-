-- 留言板回复功能数据库迁移脚本
-- 执行日期：$(date)
-- 描述：为留言板添加回复功能的数据库结构优化

-- 1. 确保 messages 表已有回复字段（如果不存在则添加）
DO $$
BEGIN
    -- 检查并添加 reply_to 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'reply_to'
    ) THEN
        ALTER TABLE messages ADD COLUMN reply_to BIGINT REFERENCES messages(id) ON DELETE CASCADE;
    END IF;
    
    -- 检查并添加 is_pinned 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE messages ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- 检查并添加 emoji_reactions 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'emoji_reactions'
    ) THEN
        ALTER TABLE messages ADD COLUMN emoji_reactions JSONB DEFAULT '{}';
    END IF;
    
    -- 检查并添加 updated_at 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. 创建或更新索引以优化回复功能查询
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_desc ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_likes_desc ON messages(likes DESC);

-- 3. 创建复合索引以优化常见查询
CREATE INDEX IF NOT EXISTS idx_messages_reply_created ON messages(reply_to, created_at) WHERE reply_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_main_created ON messages(created_at DESC) WHERE reply_to IS NULL;

-- 4. 更新现有留言表的 updated_at 字段
UPDATE messages SET updated_at = created_at WHERE updated_at IS NULL;

-- 5. 创建触发器自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_messages_updated_at_trigger ON messages;
CREATE TRIGGER update_messages_updated_at_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_messages_updated_at();

-- 6. 创建数据库函数：获取留言树结构（优化版本）
CREATE OR REPLACE FUNCTION get_messages_with_replies()
RETURNS TABLE(
    id BIGINT,
    name TEXT,
    text TEXT,
    likes INTEGER,
    user_id BIGINT,
    reply_to BIGINT,
    is_pinned BOOLEAN,
    emoji_reactions JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    reply_count INTEGER,
    latest_reply_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.text,
        m.likes,
        m.user_id,
        m.reply_to,
        m.is_pinned,
        m.emoji_reactions,
        m.created_at,
        m.updated_at,
        COALESCE(r.reply_count, 0)::INTEGER,
        r.latest_reply_at
    FROM messages m
    LEFT JOIN (
        SELECT 
            reply_to,
            COUNT(*)::INTEGER as reply_count,
            MAX(created_at) as latest_reply_at
        FROM messages 
        WHERE reply_to IS NOT NULL 
        GROUP BY reply_to
    ) r ON m.id = r.reply_to
    ORDER BY 
        CASE WHEN m.is_pinned THEN 0 ELSE 1 END,
        m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. 创建数据库函数：获取指定留言的所有回复
CREATE OR REPLACE FUNCTION get_replies_for_message(parent_id BIGINT)
RETURNS TABLE(
    id BIGINT,
    name TEXT,
    text TEXT,
    likes INTEGER,
    user_id BIGINT,
    emoji_reactions JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.text,
        m.likes,
        m.user_id,
        m.emoji_reactions,
        m.created_at,
        m.updated_at
    FROM messages m
    WHERE m.reply_to = parent_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建数据库函数：批量获取多个留言的回复数量
CREATE OR REPLACE FUNCTION get_bulk_reply_counts(message_ids BIGINT[])
RETURNS TABLE(
    message_id BIGINT,
    reply_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(message_ids) as message_id,
        COALESCE(
            (SELECT COUNT(*)::INTEGER FROM messages WHERE reply_to = unnest(message_ids)),
            0
        ) as reply_count;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建数据库函数：清理孤立回复（父留言被删除的回复）
CREATE OR REPLACE FUNCTION cleanup_orphaned_replies()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM messages 
    WHERE reply_to IS NOT NULL 
      AND reply_to NOT IN (SELECT id FROM messages WHERE reply_to IS NULL);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. 创建数据库函数：获取用户的回复统计
CREATE OR REPLACE FUNCTION get_user_reply_stats(user_id_param BIGINT)
RETURNS TABLE(
    total_messages INTEGER,
    total_replies INTEGER,
    avg_likes_per_message NUMERIC,
    avg_likes_per_reply NUMERIC,
    most_liked_message_id BIGINT,
    most_liked_reply_id BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM messages WHERE user_id = user_id_param AND reply_to IS NULL),
        (SELECT COUNT(*)::INTEGER FROM messages WHERE user_id = user_id_param AND reply_to IS NOT NULL),
        (SELECT COALESCE(AVG(likes), 0) FROM messages WHERE user_id = user_id_param AND reply_to IS NULL),
        (SELECT COALESCE(AVG(likes), 0) FROM messages WHERE user_id = user_id_param AND reply_to IS NOT NULL),
        (SELECT id FROM messages WHERE user_id = user_id_param AND reply_to IS NULL ORDER BY likes DESC LIMIT 1),
        (SELECT id FROM messages WHERE user_id = user_id_param AND reply_to IS NOT NULL ORDER BY likes DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- 11. 插入示例回复数据（如果不存在）
INSERT INTO messages (name, text, likes, user_id, reply_to, emoji_reactions) 
SELECT * FROM (
    VALUES 
        ('涵宝', '谢谢琛宝的欢迎！我也很喜欢这里💖', 2, 2, 
         (SELECT id FROM messages WHERE text LIKE '%欢迎来到我们的温馨小屋%' LIMIT 1), 
         '{"💖": 2}'::jsonb),
        ('琛宝', '有你在的地方就是最温馨的家～', 4, 1, 
         (SELECT id FROM messages WHERE text LIKE '%欢迎来到我们的温馨小屋%' LIMIT 1), 
         '{"🏠": 2, "💕": 2}'::jsonb),
        ('琛宝', '我们一起创造更多美好的回忆吧！✨', 3, 1, 
         (SELECT id FROM messages WHERE text LIKE '%这里真是一个温暖的地方%' LIMIT 1), 
         '{"✨": 3}'::jsonb),
        ('涵宝', '七夕快乐！愿我们的爱情天长地久🌹', 6, 2, 
         (SELECT id FROM messages WHERE text LIKE '%七夕节快乐%' LIMIT 1), 
         '{"🌹": 4, "💕": 2}'::jsonb),
        ('琛宝', '每天和你在一起都像过节一样开心😊', 3, 1, 
         (SELECT id FROM messages WHERE text LIKE '%七夕节快乐%' LIMIT 1), 
         '{"😊": 3}'::jsonb)
) AS new_messages(name, text, likes, user_id, reply_to, emoji_reactions)
WHERE NOT EXISTS (
    SELECT 1 FROM messages WHERE reply_to IS NOT NULL LIMIT 1
);

-- 12. 创建留言板健康检查函数
CREATE OR REPLACE FUNCTION message_board_health_check()
RETURNS TABLE(
    metric_name TEXT,
    metric_value TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Total Messages'::TEXT,
        (SELECT COUNT(*)::TEXT FROM messages),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'Main Messages'::TEXT,
        (SELECT COUNT(*)::TEXT FROM messages WHERE reply_to IS NULL),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'Replies'::TEXT,
        (SELECT COUNT(*)::TEXT FROM messages WHERE reply_to IS NOT NULL),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'Orphaned Replies'::TEXT,
        (SELECT COUNT(*)::TEXT FROM messages WHERE reply_to IS NOT NULL AND reply_to NOT IN (SELECT id FROM messages WHERE reply_to IS NULL)),
        CASE WHEN (SELECT COUNT(*) FROM messages WHERE reply_to IS NOT NULL AND reply_to NOT IN (SELECT id FROM messages WHERE reply_to IS NULL)) = 0 THEN 'OK' ELSE 'WARNING' END
    UNION ALL
    SELECT 
        'Avg Replies per Message'::TEXT,
        (SELECT COALESCE(ROUND(AVG(reply_count), 2), 0)::TEXT FROM (
            SELECT COUNT(*) as reply_count 
            FROM messages 
            WHERE reply_to IS NOT NULL 
            GROUP BY reply_to
        ) sub),
        'OK'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 执行完成消息
DO $$
BEGIN
    RAISE NOTICE '留言板回复功能数据库迁移完成！';
    RAISE NOTICE '执行健康检查...';
END $$;

-- 显示健康检查结果
SELECT * FROM message_board_health_check();
