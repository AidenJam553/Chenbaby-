import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, User, Clock, ThumbsUp } from 'lucide-react'
import { messageAPI } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'
import './MessageBoard.css'

const MessageBoard = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ text: '' })

  // 获取留言列表
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const data = await messageAPI.getMessages()
      setMessages(data)
    } catch (error) {
      console.error('获取留言失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 提交留言
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.text.trim()) {
      alert('请填写留言内容')
      return
    }

    if (!user) {
      alert('请先登录后再发表留言')
      return
    }

    try {
      setSubmitting(true)
      await messageAPI.addMessage(user.display_name || user.username, formData.text.trim())
      setFormData({ text: '' })
      fetchMessages() // 重新获取留言列表
    } catch (error) {
      console.error('提交留言失败:', error)
      alert('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 点赞留言
  const handleLike = async (id) => {
    try {
      await messageAPI.likeMessage(id)
      fetchMessages() // 重新获取留言列表
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div className="message-board">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          <Heart className="title-icon" />
          留言板
        </h1>
        <p className="page-subtitle">宝贝，留下想说的话吧~ 💕</p>
      </motion.div>

      {/* 添加留言表单 */}
      <motion.div
        className="message-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="message-form">
          {user && (
            <div className="current-user-info">
              <User className="user-icon" />
              <span>当前用户: {user.display_name || user.username}</span>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="text">留言内容</label>
              <textarea
                id="text"
                className="input"
                placeholder="写下你想说的话..."
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                maxLength={500}
                rows={3}
                required
                disabled={!user}
              />
              {!user && (
                <p className="login-hint">请先登录后再发表留言</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={submitting || !user}
          >
            <Send className="btn-icon" />
            {submitting ? '发送中...' : '发送留言'}
          </button>
        </form>
      </motion.div>

      {/* 留言列表 */}
      <motion.div
        className="messages-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="section-title">留言列表</h2>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-icon" />
            <p>还没有留言，快来留下第一条吧！</p>
          </div>
        ) : (
          <div className="messages-list">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className="message-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="message-header">
                    <div className="message-author">
                      <User className="author-icon" />
                      <span className="author-name">{message.name}</span>
                    </div>
                    <div className="message-time">
                      <Clock className="time-icon" />
                      <span>{formatTime(message.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="message-content">
                    {message.text}
                  </div>
                  
                  <div className="message-footer">
                    <button
                      className="like-btn"
                      onClick={() => handleLike(message.id)}
                    >
                      <ThumbsUp className="like-icon" />
                      <span>{message.likes || 0}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MessageBoard
