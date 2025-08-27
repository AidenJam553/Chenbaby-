-- Storage 存储桶策略配置
-- 在 Supabase SQL Editor 中运行此脚本

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;

-- 创建读取策略
CREATE POLICY "Allow public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

-- 创建上传策略
CREATE POLICY "Allow public upload access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'photos');

-- 创建更新策略
CREATE POLICY "Allow public update access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'photos');

-- 创建删除策略
CREATE POLICY "Allow public delete access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'photos');
