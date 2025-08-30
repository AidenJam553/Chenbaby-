import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, User, Clock, ThumbsUp, MessageCircle, Reply } from 'lucide-react'
import { messageAPI } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'
import './MessageBoard.css'

const MessageBoard = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ text: '' })
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyFormData, setReplyFormData] = useState({ text: '' })
  const [expandedReplies, setExpandedReplies] = useState(new Set())

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

  // 提交回复
  const handleReplySubmit = async (e, messageId) => {
    e.preventDefault()
    if (!replyFormData.text.trim()) {
      alert('请填写回复内容')
      return
    }

    if (!user) {
      alert('请先登录后再发表回复')
      return
    }

    try {
      setSubmitting(true)
      await messageAPI.addReply(user.display_name || user.username, replyFormData.text.trim(), messageId)
      setReplyFormData({ text: '' })
      setReplyingTo(null)
      fetchMessages() // 重新获取留言列表
    } catch (error) {
      console.error('提交回复失败:', error)
      alert('提交回复失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 开始回复
  const startReply = (messageId) => {
    setReplyingTo(messageId)
    setReplyFormData({ text: '' })
  }

  // 取消回复
  const cancelReply = () => {
    setReplyingTo(null)
    setReplyFormData({ text: '' })
  }

  // 切换回复显示
  const toggleReplies = (messageId) => {
    const newExpanded = new Set(expandedReplies)
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId)
    } else {
      newExpanded.add(messageId)
    }
    setExpandedReplies(newExpanded)
  }

  // 获取主留言（非回复）
  const getMainMessages = () => {
    return messages.filter(message => !message.reply_to)
  }

  // 获取指定留言的回复
  const getMessageReplies = (messageId) => {
    return messages.filter(message => message.reply_to === messageId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
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
        ) : getMainMessages().length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-icon" />
            <p>还没有留言，快来留下第一条吧！</p>
          </div>
        ) : (
          <div className="messages-list">
            <AnimatePresence>
              {getMainMessages().map((message, index) => {
                const replies = getMessageReplies(message.id)
                const hasReplies = replies.length > 0
                const isExpanded = expandedReplies.has(message.id)
                
                return (
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
                      <div className="message-actions">
                        <button
                          className="like-btn"
                          onClick={() => handleLike(message.id)}
                        >
                          <ThumbsUp className="like-icon" />
                          <span>{message.likes || 0}</span>
                        </button>
                        
                        <button
                          className="reply-btn"
                          onClick={() => startReply(message.id)}
                          disabled={!user}
                        >
                          <Reply className="reply-icon" />
                          <span className="btn-text">回复</span>
                        </button>
                        
                        {hasReplies && (
                          <button
                            className="toggle-replies-btn"
                            onClick={() => toggleReplies(message.id)}
                          >
                            <MessageCircle className="replies-icon" />
                            <span className="btn-text">
                              <span className="mobile-short">{isExpanded ? '收起' : replies.length}</span>
                              <span className="desktop-full">{isExpanded ? '收起' : '查看'} {replies.length} 条回复</span>
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 回复表单 */}
                    {replyingTo === message.id && (
                      <motion.div
                        className="reply-form-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <form onSubmit={(e) => handleReplySubmit(e, message.id)} className="reply-form">
                          <div className="form-group">
                            <textarea
                              className="input reply-input"
                              placeholder="写下你的回复..."
                              value={replyFormData.text}
                              onChange={(e) => setReplyFormData({ text: e.target.value })}
                              maxLength={500}
                              rows={2}
                              required
                            />
                          </div>
                          <div className="reply-form-actions">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={cancelReply}
                            >
                              取消
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={submitting || !replyFormData.text.trim()}
                            >
                              <Send className="btn-icon" />
                              {submitting ? '发送中...' : '发送回复'}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* 回复列表 */}
                    {hasReplies && isExpanded && (
                      <motion.div
                        className="replies-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="replies-list">
                          {replies.map((reply, replyIndex) => (
                            <motion.div
                              key={reply.id}
                              className="reply-card"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: replyIndex * 0.05 }}
                            >
                              <div className="reply-header">
                                <div className="reply-author">
                                  <User className="author-icon" />
                                  <span className="author-name">{reply.name}</span>
                                </div>
                                <div className="reply-time">
                                  <Clock className="time-icon" />
                                  <span>{formatTime(reply.created_at)}</span>
                                </div>
                              </div>
                              
                              <div className="reply-content">
                                {reply.text}
                              </div>
                              
                              <div className="reply-footer">
                                <button
                                  className="like-btn small"
                                  onClick={() => handleLike(reply.id)}
                                >
                                  <ThumbsUp className="like-icon" />
                                  <span>{reply.likes || 0}</span>
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MessageBoard
