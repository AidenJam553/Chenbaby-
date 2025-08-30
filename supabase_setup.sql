-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT, -- 用户头像URL（可选）
  bio TEXT, -- 用户简介（可选）
  last_login_at TIMESTAMP WITH TIME ZONE, -- 最后登录时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建照片表
CREATE TABLE IF NOT EXISTS photos (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  tag TEXT,
  description TEXT, -- 照片描述
  uploaded_by TEXT NOT NULL, -- 上传者显示名
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- 级联删除
  file_size BIGINT, -- 文件大小（字节）
  file_type TEXT, -- 文件类型（image/jpeg等）
  storage_path TEXT, -- Supabase存储路径
  is_favorite BOOLEAN DEFAULT FALSE, -- 是否为收藏照片
  view_count INTEGER DEFAULT 0, -- 查看次数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建留言表
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- 关联用户ID
  reply_to BIGINT REFERENCES messages(id) ON DELETE CASCADE, -- 回复的留言ID（可选）
  is_pinned BOOLEAN DEFAULT FALSE, -- 是否置顶
  emoji_reactions JSONB DEFAULT '{}', -- 表情反应统计 {"😍": 2, "💕": 3}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建问题表
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c')),
  explanation TEXT, -- 答案解释（可选）
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3), -- 难度等级
  category TEXT DEFAULT 'general', -- 问题分类
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  answered_by TEXT,
  answered_by_name TEXT, -- 回答者显示名
  user_answer CHAR(1) CHECK (user_answer IN ('a', 'b', 'c')),
  is_correct BOOLEAN,
  answer_time_seconds INTEGER, -- 回答用时（秒）
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 删除旧的qa_pairs表（如果存在）
DROP TABLE IF EXISTS qa_pairs;

-- 创建游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'memory', -- 游戏类型
  moves INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 3),
  difficulty_level INTEGER DEFAULT 1, -- 难度等级
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户会话表（可选，用于更好的会话管理）
CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建系统设置表（存储应用配置）
CREATE TABLE IF NOT EXISTS app_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认用户数据
INSERT INTO users (username, password, display_name, bio, last_login_at) VALUES 
  ('chenchen', 'chenbao123', '琛宝', '你好，我是琛宝💕', NOW()),
  ('Jacob', 'hanbao123', '涵宝', '你好，我是涵宝😊', NOW())
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  last_login_at = EXCLUDED.last_login_at,
  updated_at = NOW();

-- 插入示例问题数据
INSERT INTO questions (question, option_a, option_b, option_c, correct_answer, explanation, difficulty, category, created_by, created_by_name, answered_by, answered_by_name, user_answer, is_correct, answered_at) VALUES 
  ('我最喜欢的宠物是什么？', '小猫', '小狗', '小兔子', 'a', '琛宝最喜欢的是可爱的小猫咪！', 1, 'personal', 'chenchen', '琛宝', NULL, NULL, NULL, NULL, NULL),
  ('我们第一次约会去了哪里？', '咖啡厅', '公园', '电影院', 'b', '我们第一次约会在美丽的公园里，那是一个很温馨的下午。', 2, 'relationship', 'Jacob', '涵宝', 'chenchen', '琛宝', 'b', true, NOW() - INTERVAL '1 hour'),
  ('我的生日是哪一天？', '5月15日', '6月20日', '7月10日', 'a', '记住这个特殊的日子哦！', 1, 'personal', 'chenchen', '琛宝', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 插入示例留言数据
INSERT INTO messages (name, text, likes, user_id, emoji_reactions) VALUES 
  ('琛宝', '欢迎来到我们的温馨小屋！这里是我们专属的小天地💕', 5, 1, '{"💕": 3, "😍": 2}'),
  ('涵宝', '这里真是一个温暖的地方呢～希望我们能在这里留下更多美好的回忆', 3, 2, '{"🥰": 2, "💖": 1}'),
  ('琛宝', '七夕节快乐！愿我们永远幸福💫', 8, 1, '{"💫": 4, "💕": 4}')
ON CONFLICT DO NOTHING;

-- 插入示例回复数据（需要在主留言创建后执行）
DO $$
DECLARE
    welcome_msg_id BIGINT;
    warm_msg_id BIGINT;
    festival_msg_id BIGINT;
BEGIN
    -- 获取主留言的ID
    SELECT id INTO welcome_msg_id FROM messages WHERE text LIKE '欢迎来到我们的温馨小屋！%' LIMIT 1;
    SELECT id INTO warm_msg_id FROM messages WHERE text LIKE '这里真是一个温暖的地方呢～%' LIMIT 1;
    SELECT id INTO festival_msg_id FROM messages WHERE text LIKE '七夕节快乐！%' LIMIT 1;
    
    -- 插入回复数据
    IF welcome_msg_id IS NOT NULL THEN
        INSERT INTO messages (name, text, likes, user_id, reply_to, emoji_reactions) VALUES 
            ('涵宝', '谢谢琛宝的欢迎！我也很喜欢这里💖', 2, 2, welcome_msg_id, '{"💖": 2}'),
            ('琛宝', '有你在的地方就是最温馨的家～', 4, 1, welcome_msg_id, '{"🏠": 2, "💕": 2}')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF warm_msg_id IS NOT NULL THEN
        INSERT INTO messages (name, text, likes, user_id, reply_to, emoji_reactions) VALUES 
            ('琛宝', '我们一起创造更多美好的回忆吧！✨', 3, 1, warm_msg_id, '{"✨": 3}')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF festival_msg_id IS NOT NULL THEN
        INSERT INTO messages (name, text, likes, user_id, reply_to, emoji_reactions) VALUES 
            ('涵宝', '七夕快乐！愿我们的爱情天长地久🌹', 6, 2, festival_msg_id, '{"🌹": 4, "💕": 2}'),
            ('琛宝', '每天和你在一起都像过节一样开心😊', 3, 1, festival_msg_id, '{"😊": 3}')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 插入示例照片数据
INSERT INTO photos (url, tag, description, uploaded_by, user_id, is_favorite) VALUES 
  ('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=600&fit=crop', '温馨时光', '和你在一起的每一刻都很珍贵', '琛宝', 1, true),
  ('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=600&fit=crop', '美好回忆', '这张照片记录了我们的快乐时光', '涵宝', 2, true),
  ('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=600&fit=crop', '甜蜜约会', '我们的第一次约会留念', '琛宝', 1, false)
ON CONFLICT DO NOTHING;

-- 插入示例游戏记录
INSERT INTO game_records (player_name, game_type, moves, time_seconds, stars, user_id) VALUES 
  ('琛宝', 'memory', 18, 45, 2, 1),
  ('涵宝', 'memory', 14, 38, 3, 2),
  ('琛宝', 'memory', 20, 52, 2, 1),
  ('涵宝', 'memory', 16, 42, 3, 2)
ON CONFLICT DO NOTHING;

-- 插入系统设置
INSERT INTO app_settings (setting_key, setting_value, description) VALUES 
  ('site_title', '"小琛和小涵的温馨小屋"', '网站标题'),
  ('max_file_size', '10485760', '最大文件上传大小（10MB）'),
  ('allowed_file_types', '["image/jpeg", "image/png", "image/gif", "image/webp"]', '允许的文件类型'),
  ('features_enabled', '{"messages": true, "photos": true, "qa": true, "games": true}', '启用的功能模块'),
  ('theme_colors', '{"primary": "#FF6B9D", "secondary": "#A8E6CF", "accent": "#FFB3D1"}', '主题颜色配置')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON users;
DROP POLICY IF EXISTS "Allow public insert access" ON users;
DROP POLICY IF EXISTS "Allow public update access" ON users;

DROP POLICY IF EXISTS "Allow public read access" ON photos;
DROP POLICY IF EXISTS "Allow public insert access" ON photos;
DROP POLICY IF EXISTS "Allow public update access" ON photos;
DROP POLICY IF EXISTS "Allow public delete access" ON photos;

DROP POLICY IF EXISTS "Allow public read access" ON messages;
DROP POLICY IF EXISTS "Allow public insert access" ON messages;
DROP POLICY IF EXISTS "Allow public update access" ON messages;

DROP POLICY IF EXISTS "Allow public read access" ON questions;
DROP POLICY IF EXISTS "Allow public insert access" ON questions;
DROP POLICY IF EXISTS "Allow public update access" ON questions;

DROP POLICY IF EXISTS "Allow public read access" ON game_records;
DROP POLICY IF EXISTS "Allow public insert access" ON game_records;

DROP POLICY IF EXISTS "Allow public read access" ON user_sessions;
DROP POLICY IF EXISTS "Allow public insert access" ON user_sessions;
DROP POLICY IF EXISTS "Allow public update access" ON user_sessions;
DROP POLICY IF EXISTS "Allow public delete access" ON user_sessions;

DROP POLICY IF EXISTS "Allow public read access" ON app_settings;
DROP POLICY IF EXISTS "Allow public update access" ON app_settings;

-- 创建用户表策略
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);

-- 创建照片表策略
CREATE POLICY "Allow public read access" ON photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON photos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON photos FOR DELETE USING (true);

-- 创建留言表策略
CREATE POLICY "Allow public read access" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON messages FOR UPDATE USING (true);

-- 创建问题表策略
CREATE POLICY "Allow public read access" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON questions FOR UPDATE USING (true);

-- 创建游戏记录表策略
CREATE POLICY "Allow public read access" ON game_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON game_records FOR INSERT WITH CHECK (true);

-- 创建用户会话表策略（更严格的权限控制）
CREATE POLICY "Allow user own sessions" ON user_sessions FOR ALL USING (true);

-- 创建系统设置表策略（只允许读取，更新需要管理员权限）
CREATE POLICY "Allow public read settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON app_settings FOR UPDATE USING (true);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);

CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_tag ON photos(tag);
CREATE INDEX IF NOT EXISTS idx_photos_is_favorite ON photos(is_favorite);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON messages(is_pinned);

CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_answered_by ON questions(answered_by);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

CREATE INDEX IF NOT EXISTS idx_game_records_player_name ON game_records(player_name);
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_game_type ON game_records(game_type);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_records_stars ON game_records(stars);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- 创建用于统计的视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.username,
  u.display_name,
  u.last_login_at,
  COALESCE(asked.questions_asked, 0) as questions_asked,
  COALESCE(answered.questions_answered, 0) as questions_answered,
  COALESCE(answered.correct_answers, 0) as correct_answers,
  CASE 
    WHEN COALESCE(answered.questions_answered, 0) = 0 THEN 0
    ELSE ROUND((COALESCE(answered.correct_answers, 0)::DECIMAL / answered.questions_answered) * 100, 1)
  END as accuracy_percentage,
  COALESCE(photos.photo_count, 0) as photos_uploaded,
  COALESCE(messages.message_count, 0) as messages_posted,
  COALESCE(games.games_played, 0) as games_played,
  COALESCE(games.best_score, 0) as best_game_score
FROM users u
LEFT JOIN (
  SELECT created_by, COUNT(*) as questions_asked
  FROM questions
  GROUP BY created_by
) asked ON u.username = asked.created_by
LEFT JOIN (
  SELECT 
    answered_by, 
    COUNT(*) as questions_answered,
    COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_answers
  FROM questions
  WHERE answered_by IS NOT NULL
  GROUP BY answered_by
) answered ON u.username = answered.answered_by
LEFT JOIN (
  SELECT user_id, COUNT(*) as photo_count
  FROM photos
  GROUP BY user_id
) photos ON u.id = photos.user_id
LEFT JOIN (
  SELECT 
    user_id, 
    COUNT(*) as message_count,
    COUNT(CASE WHEN reply_to IS NULL THEN 1 END) as main_messages,
    COUNT(CASE WHEN reply_to IS NOT NULL THEN 1 END) as replies
  FROM messages
  WHERE user_id IS NOT NULL
  GROUP BY user_id
) messages ON u.id = messages.user_id
LEFT JOIN (
  SELECT 
    user_id, 
    COUNT(*) as games_played,
    MIN(moves) as best_score
  FROM game_records
  WHERE user_id IS NOT NULL
  GROUP BY user_id
) games ON u.id = games.user_id;

-- 创建照片统计视图
CREATE OR REPLACE VIEW photo_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as upload_date,
  COUNT(*) as daily_uploads,
  COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorites_count,
  AVG(view_count) as avg_views
FROM photos
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY upload_date DESC;

-- 创建游戏排行榜视图
CREATE OR REPLACE VIEW game_leaderboard AS
SELECT 
  player_name,
  game_type,
  MIN(moves) as best_moves,
  MIN(time_seconds) as best_time,
  MAX(stars) as max_stars,
  COUNT(*) as games_played,
  RANK() OVER (PARTITION BY game_type ORDER BY MIN(moves), MIN(time_seconds)) as rank
FROM game_records
GROUP BY player_name, game_type
ORDER BY game_type, rank;

-- 创建留言板统计视图
CREATE OR REPLACE VIEW message_board_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as message_date,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN reply_to IS NULL THEN 1 END) as main_messages,
  COUNT(CASE WHEN reply_to IS NOT NULL THEN 1 END) as replies,
  SUM(likes) as total_likes,
  AVG(likes) as avg_likes,
  COUNT(DISTINCT name) as unique_contributors
FROM messages
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY message_date DESC;

-- 创建热门留言视图（包含回复统计）
CREATE OR REPLACE VIEW popular_messages AS
SELECT 
  m.id,
  m.name,
  m.text,
  m.likes,
  m.emoji_reactions,
  m.created_at,
  COALESCE(reply_stats.reply_count, 0) as reply_count,
  reply_stats.latest_reply_at,
  CASE 
    WHEN m.reply_to IS NULL THEN 'main'
    ELSE 'reply'
  END as message_type,
  -- 热度计算：点赞数 + 回复数 * 0.5 + 时间衰减因子
  (m.likes + COALESCE(reply_stats.reply_count, 0) * 0.5 + 
   EXTRACT(EPOCH FROM (NOW() - m.created_at)) / 3600 * -0.1) as popularity_score
FROM messages m
LEFT JOIN (
  SELECT 
    reply_to,
    COUNT(*) as reply_count,
    MAX(created_at) as latest_reply_at
  FROM messages 
  WHERE reply_to IS NOT NULL 
  GROUP BY reply_to
) reply_stats ON m.id = reply_stats.reply_to
WHERE m.reply_to IS NULL -- 只显示主留言
ORDER BY popularity_score DESC;

-- 创建数据库函数：清理过期会话
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建数据库函数：更新用户最后登录时间
CREATE OR REPLACE FUNCTION update_user_last_login(username_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET last_login_at = NOW(), updated_at = NOW()
  WHERE username = username_param;
END;
$$ LANGUAGE plpgsql;

-- 创建数据库函数：获取用户活跃度统计
CREATE OR REPLACE FUNCTION get_user_activity_stats(username_param TEXT)
RETURNS TABLE(
  total_messages INTEGER,
  total_replies INTEGER,
  total_photos INTEGER,
  total_questions_asked INTEGER,
  total_questions_answered INTEGER,
  total_games_played INTEGER,
  activity_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*)::INTEGER FROM messages m JOIN users u ON m.user_id = u.id WHERE u.username = username_param AND m.reply_to IS NULL), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM messages m JOIN users u ON m.user_id = u.id WHERE u.username = username_param AND m.reply_to IS NOT NULL), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM photos p JOIN users u ON p.user_id = u.id WHERE u.username = username_param), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM questions WHERE created_by = username_param), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM questions WHERE answered_by = username_param), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM game_records g JOIN users u ON g.user_id = u.id WHERE u.username = username_param), 0),
    COALESCE((
      SELECT (
        COALESCE((SELECT COUNT(*) FROM messages m JOIN users u ON m.user_id = u.id WHERE u.username = username_param AND m.reply_to IS NULL), 0) * 2 +
        COALESCE((SELECT COUNT(*) FROM messages m JOIN users u ON m.user_id = u.id WHERE u.username = username_param AND m.reply_to IS NOT NULL), 0) * 1 +
        COALESCE((SELECT COUNT(*) FROM photos p JOIN users u ON p.user_id = u.id WHERE u.username = username_param), 0) * 3 +
        COALESCE((SELECT COUNT(*) FROM questions WHERE created_by = username_param), 0) * 5 +
        COALESCE((SELECT COUNT(*) FROM questions WHERE answered_by = username_param), 0) * 3 +
        COALESCE((SELECT COUNT(*) FROM game_records g JOIN users u ON g.user_id = u.id WHERE u.username = username_param), 0) * 1
      )::INTEGER
    ), 0);
END;
$$ LANGUAGE plpgsql;

-- 创建数据库函数：获取留言及其回复数量
CREATE OR REPLACE FUNCTION get_message_with_reply_count(message_id_param BIGINT)
RETURNS TABLE(
  message_id BIGINT,
  reply_count INTEGER,
  latest_reply_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    message_id_param,
    COALESCE((SELECT COUNT(*)::INTEGER FROM messages WHERE reply_to = message_id_param), 0),
    (SELECT MAX(created_at) FROM messages WHERE reply_to = message_id_param);
END;
$$ LANGUAGE plpgsql;

-- 创建数据库函数：获取完整的留言树（包括回复）
CREATE OR REPLACE FUNCTION get_message_thread(message_id_param BIGINT)
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
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE message_tree AS (
    -- 根留言
    SELECT 
      m.id, m.name, m.text, m.likes, m.user_id, m.reply_to, 
      m.is_pinned, m.emoji_reactions, m.created_at, m.updated_at,
      0 as level
    FROM messages m
    WHERE m.id = message_id_param
    
    UNION ALL
    
    -- 回复
    SELECT 
      m.id, m.name, m.text, m.likes, m.user_id, m.reply_to,
      m.is_pinned, m.emoji_reactions, m.created_at, m.updated_at,
      mt.level + 1
    FROM messages m
    INNER JOIN message_tree mt ON m.reply_to = mt.id
    WHERE mt.level < 10 -- 防止无限递归，最多10层
  )
  SELECT * FROM message_tree ORDER BY level, created_at;
END;
$$ LANGUAGE plpgsql;

-- 创建数据库函数：获取热门回复
CREATE OR REPLACE FUNCTION get_popular_replies(limit_param INTEGER DEFAULT 10)
RETURNS TABLE(
  id BIGINT,
  name TEXT,
  text TEXT,
  likes INTEGER,
  reply_to BIGINT,
  parent_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.text,
    r.likes,
    r.reply_to,
    p.text as parent_text,
    r.created_at
  FROM messages r
  JOIN messages p ON r.reply_to = p.id
  WHERE r.reply_to IS NOT NULL
  ORDER BY r.likes DESC, r.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;