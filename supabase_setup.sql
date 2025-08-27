-- 创建照片表
CREATE TABLE IF NOT EXISTS photos (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建留言表
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建问答表
CREATE TABLE IF NOT EXISTS qa_pairs (
  id BIGSERIAL PRIMARY KEY,
  q TEXT NOT NULL,
  a TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略 (RLS)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_pairs ENABLE ROW LEVEL SECURITY;

-- 创建允许所有人读取和插入的策略
CREATE POLICY "Allow public read access" ON photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON photos FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON messages FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON qa_pairs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON qa_pairs FOR INSERT WITH CHECK (true);
