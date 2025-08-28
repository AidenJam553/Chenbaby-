import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Upload, Plus, X, Tag, Calendar, User, Trash2 } from 'lucide-react'
import { photoAPI } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'
import './PhotoAlbum.css'

const PhotoAlbum = () => {
  const { user } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [formData, setFormData] = useState({ url: '', tag: '' })

  // 获取照片列表
  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const data = await photoAPI.getPhotos()
      setPhotos(data)
    } catch (error) {
      console.error('获取照片失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 提交新照片
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.url.trim()) {
      alert('请填写图片链接')
      return
    }

    if (!user) {
      alert('请先登录后再上传照片')
      return
    }

    try {
      setUploading(true)
      await photoAPI.addPhoto(
        formData.url.trim(), 
        formData.tag.trim(),
        user.display_name || user.username,
        user.id
      )
      setFormData({ url: '', tag: '' })
      setShowUploadModal(false)
      fetchPhotos() // 重新获取照片列表
    } catch (error) {
      console.error('添加照片失败:', error)
      alert('添加失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  // 处理文件上传
  const handleFileUpload = async (file) => {
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    try {
      setUploading(true)
      
      // 检查 Supabase 是否配置
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const isConfigured = supabaseUrl && supabaseKey && 
        supabaseUrl !== 'https://your-project-id.supabase.co' && 
        supabaseKey !== 'your-anon-key-here'

      if (!isConfigured) {
        // 如果 Supabase 未配置，使用本地预览
        const reader = new FileReader()
        reader.onload = async (e) => {
          const dataUrl = e.target.result
          await photoAPI.addPhoto(
            dataUrl, 
            formData.tag.trim(),
            user.display_name || user.username,
            user.id
          )
          setFormData({ url: '', tag: '' })
          setShowUploadModal(false)
          fetchPhotos()
        }
        reader.readAsDataURL(file)
        return
      }

      // Supabase 已配置，正常上传
      const fileName = `${Date.now()}-${file.name}`
      await photoAPI.uploadFile(file, fileName)
      const publicUrl = photoAPI.getPublicUrl(fileName)
      await photoAPI.addPhoto(
        publicUrl, 
        formData.tag.trim(),
        user.display_name || user.username,
        user.id
      )
      setFormData({ url: '', tag: '' })
      setShowUploadModal(false)
      fetchPhotos()
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试。如果问题持续，请使用图片链接方式。')
    } finally {
      setUploading(false)
    }
  }

  // 删除照片
  const handleDeletePhoto = async (photo) => {
    if (!user) {
      alert('请先登录')
      return
    }

    if (photo.user_id !== user.id) {
      alert('只能删除自己上传的照片')
      return
    }

    if (!confirm('确定要删除这张照片吗？')) {
      return
    }

    try {
      setDeleting(photo.id)
      await photoAPI.deletePhoto(photo.id, user.id)
      fetchPhotos() // 重新获取照片列表
    } catch (error) {
      console.error('删除照片失败:', error)
      alert('删除失败，请重试')
    } finally {
      setDeleting(null)
    }
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  return (
    <div className="photo-album">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          <Image className="title-icon" />
          相册
        </h1>
        <p className="page-subtitle">咔嚓咔嚓，我们的照片放上来！ 📸</p>
      </motion.div>

      {/* 添加照片按钮 */}
      <motion.div
        className="add-photo-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          className="btn btn-primary add-photo-btn"
          onClick={() => {
            if (!user) {
              alert('请先登录后再上传照片')
              return
            }
            setShowUploadModal(true)
          }}
          disabled={!user}
        >
          <Plus className="btn-icon" />
          {user ? '添加照片' : '请先登录'}
        </button>
      </motion.div>

      {/* 照片网格 */}
      <motion.div
        className="photos-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="empty-state">
            <Image className="empty-icon" />
            <p>还没有照片，快来添加第一张吧！</p>
          </div>
        ) : (
          <div className="photos-grid">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="photo-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="photo-wrapper">
                    <img
                      src={photo.url}
                      alt={photo.tag || '照片'}
                      className="photo-image"
                      loading="lazy"
                    />
                    <div className="photo-overlay">
                      <div className="photo-info">
                        {photo.uploaded_by && (
                          <div className="photo-uploader">
                            <User className="uploader-icon" />
                            <span>{photo.uploaded_by}</span>
                          </div>
                        )}
                        {photo.tag && (
                          <div className="photo-tag">
                            <Tag className="tag-icon" />
                            <span>{photo.tag}</span>
                          </div>
                        )}
                        <div className="photo-date">
                          <Calendar className="date-icon" />
                          <span>{formatTime(photo.created_at)}</span>
                        </div>
                      </div>
                      {user && photo.user_id === user.id && (
                        <div className="photo-actions">
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePhoto(photo)
                            }}
                            disabled={deleting === photo.id}
                          >
                            {deleting === photo.id ? (
                              <div className="deleting-spinner"></div>
                            ) : (
                              <Trash2 className="delete-icon" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* 上传模态框 */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              className="upload-modal"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>添加照片</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-group">
                  <label htmlFor="url">图片链接</label>
                  <input
                    type="url"
                    id="url"
                    className="input"
                    placeholder="https://example.com/image.jpg"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tag">标签 (可选)</label>
                  <input
                    type="text"
                    id="tag"
                    className="input"
                    placeholder="给照片加个标签"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    maxLength={50}
                  />
                </div>

                <div className="upload-options">
                  <p className="upload-divider">或者</p>
                  
                  <div className="file-upload">
                    <label htmlFor="file" className="file-upload-label">
                      <Upload className="upload-icon" />
                      <span>选择图片文件</span>
                    </label>
                    <input
                      type="file"
                      id="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading || !formData.url.trim()}
                  >
                    {uploading ? '添加中...' : '添加照片'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="photo-preview-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="preview-header">
                <button
                  className="close-btn"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X />
                </button>
              </div>
              <div className="preview-content">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.tag || '照片'}
                  className="preview-image"
                />
                <div className="preview-info">
                  {selectedPhoto.uploaded_by && (
                    <div className="preview-uploader">
                      <User className="uploader-icon" />
                      <span>上传者: {selectedPhoto.uploaded_by}</span>
                    </div>
                  )}
                  {selectedPhoto.tag && (
                    <div className="preview-tag">
                      <Tag className="tag-icon" />
                      <span>{selectedPhoto.tag}</span>
                    </div>
                  )}
                  <div className="preview-date">
                    <Calendar className="date-icon" />
                    <span>{formatTime(selectedPhoto.created_at)}</span>
                  </div>
                  {user && selectedPhoto.user_id === user.id && (
                    <button
                      className="preview-delete-btn"
                      onClick={() => {
                        setSelectedPhoto(null)
                        handleDeletePhoto(selectedPhoto)
                      }}
                      disabled={deleting === selectedPhoto.id}
                    >
                      <Trash2 className="delete-icon" />
                      删除照片
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PhotoAlbum
