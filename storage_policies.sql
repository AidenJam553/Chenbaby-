-- Storage 存储桶策略配置
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('photos', 'photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('temp', 'temp', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar read" ON storage.objects;
DROP POLICY IF EXISTS "Allow temp file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow temp file cleanup" ON storage.objects;

-- 照片存储桶策略（主要用于相册功能）
-- 公共读取策略（所有人都可以查看照片）
CREATE POLICY "Allow public read photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

-- 公共上传策略（所有人都可以上传照片到指定文件夹）
CREATE POLICY "Allow public upload photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1] IN ('memories', 'uploads', 'shared')
  AND (metadata->>'size')::bigint <= 10485760 -- 10MB限制
);

-- 更新策略（可以更新元数据）
CREATE POLICY "Allow public update photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'photos')
WITH CHECK (bucket_id = 'photos');

-- 删除策略（任何人都可以删除照片）
CREATE POLICY "Allow public delete photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'photos');

-- 头像存储桶策略
-- 头像读取策略（公共读取）
CREATE POLICY "Allow public read avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 头像上传策略（任何人都可以上传头像）
CREATE POLICY "Allow avatar uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND (metadata->>'size')::bigint <= 2097152 -- 2MB限制
);

-- 头像删除策略（任何人都可以删除头像）
CREATE POLICY "Allow avatar delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars');

-- 临时文件存储桶策略（用于文件上传过程中的临时存储）
-- 临时文件上传策略
CREATE POLICY "Allow temp file uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'temp' 
  AND (metadata->>'size')::bigint <= 5242880 -- 5MB限制
);

-- 临时文件删除策略
CREATE POLICY "Allow temp file cleanup" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'temp');

-- 设置存储桶的 CORS 配置（如果需要从网页直接访问）
-- 注意：这部分需要在 Supabase Dashboard 中手动配置 Storage Settings

-- 创建存储文件验证函数
CREATE OR REPLACE FUNCTION validate_file_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- 检查文件大小限制
  IF NEW.bucket_id = 'photos' AND NEW.metadata->>'size' IS NOT NULL AND 
     (NEW.metadata->>'size')::bigint > 10485760 THEN
    RAISE EXCEPTION 'Photo file size exceeds 10MB limit';
  END IF;
  
  IF NEW.bucket_id = 'avatars' AND NEW.metadata->>'size' IS NOT NULL AND 
     (NEW.metadata->>'size')::bigint > 2097152 THEN
    RAISE EXCEPTION 'Avatar file size exceeds 2MB limit';
  END IF;
  
  IF NEW.bucket_id = 'temp' AND NEW.metadata->>'size' IS NOT NULL AND 
     (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'Temp file size exceeds 5MB limit';
  END IF;
  
  -- 检查文件类型
  IF NEW.bucket_id IN ('photos', 'avatars', 'temp') AND 
     NEW.metadata->>'mimetype' IS NOT NULL AND
     NEW.metadata->>'mimetype' NOT IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp') THEN
    RAISE EXCEPTION 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用文件验证触发器
DROP TRIGGER IF EXISTS validate_file_upload_trigger ON storage.objects;
CREATE TRIGGER validate_file_upload_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION validate_file_upload();

-- 创建清理过期临时文件的函数
CREATE OR REPLACE FUNCTION cleanup_old_temp_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'temp' 
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建清理过期照片（超过30天未被引用）的函数
CREATE OR REPLACE FUNCTION cleanup_unreferenced_photos()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'photos' 
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
      SELECT DISTINCT url 
      FROM photos 
      WHERE url LIKE '%' || name || '%'
    );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建获取存储使用统计的函数
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE(
  bucket_name TEXT,
  file_count BIGINT,
  total_size_bytes BIGINT,
  total_size_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bucket_id,
    COUNT(*),
    SUM((metadata->>'size')::bigint),
    ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2)
  FROM storage.objects
  GROUP BY bucket_id
  ORDER BY bucket_id;
END;
$$ LANGUAGE plpgsql;

-- 创建定期清理任务（需要 pg_cron 扩展，在生产环境中配置）
-- SELECT cron.schedule('cleanup-temp-files', '0 2 * * *', 'SELECT cleanup_old_temp_files();');
-- SELECT cron.schedule('cleanup-unreferenced-photos', '0 3 0 * *', 'SELECT cleanup_unreferenced_photos();');

-- 使用示例：
-- 获取存储统计：SELECT * FROM get_storage_stats();
-- 手动清理临时文件：SELECT cleanup_old_temp_files();
-- 手动清理未引用照片：SELECT cleanup_unreferenced_photos();