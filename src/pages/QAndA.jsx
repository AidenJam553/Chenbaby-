import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Plus, Send, MessageCircle, X, Search } from 'lucide-react'
import { qaAPI } from '../utils/supabase'
import './QAndA.css'

const QAndA = () => {
  const [qaPairs, setQaPairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [formData, setFormData] = useState({ question: '', answer: '' })

  // 获取问答列表
  const fetchQAPairs = async () => {
    try {
      setLoading(true)
      const data = await qaAPI.getQAPairs()
      setQaPairs(data)
    } catch (error) {
      console.error('获取问答失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 提交新问答
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('请填写问题和答案')
      return
    }

    try {
      setSubmitting(true)
      await qaAPI.addQAPair(formData.question.trim(), formData.answer.trim())
      setFormData({ question: '', answer: '' })
      setShowAddModal(false)
      fetchQAPairs() // 重新获取问答列表
    } catch (error) {
      console.error('添加问答失败:', error)
      alert('添加失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 搜索答案
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('请输入问题')
      return
    }

    try {
      setSearching(true)
      const result = await qaAPI.searchAnswer(searchQuery.trim())
      setSearchResult(result)
    } catch (error) {
      console.error('搜索失败:', error)
      alert('搜索失败，请重试')
    } finally {
      setSearching(false)
    }
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN')
  }

  useEffect(() => {
    fetchQAPairs()
  }, [])

  return (
    <div className="qa-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          <HelpCircle className="title-icon" />
          你问我答
        </h1>
        <p className="page-subtitle">我出题，你来答 😈💭</p>
      </motion.div>

      {/* 搜索区域 */}
      <motion.div
        className="search-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="search-container">
          <div className="search-input-group">
            <input
              type="text"
              className="input search-input"
              placeholder="输入你的问题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="btn btn-primary search-btn"
              onClick={handleSearch}
              disabled={searching}
            >
              <Search className="btn-icon" />
              {searching ? '搜索中...' : '搜索'}
            </button>
          </div>
          
          {searchResult && (
            <motion.div
              className="search-result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="result-card">
                <MessageCircle className="result-icon" />
                <div className="result-content">
                  <h4>找到答案：</h4>
                  <p>{searchResult}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {searchResult === null && searchQuery && !searching && (
            <motion.div
              className="search-result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="result-card no-result">
                <HelpCircle className="result-icon" />
                <div className="result-content">
                  <h4>没有找到答案</h4>
                  <p>这个问题还没有答案，你可以添加一个新的问答对！</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 添加问答按钮 */}
      <motion.div
        className="add-qa-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <button
          className="btn btn-primary add-qa-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="btn-icon" />
          添加问答
        </button>
      </motion.div>

      {/* 问答列表 */}
      <motion.div
        className="qa-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="section-title">问答列表</h2>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : qaPairs.length === 0 ? (
          <div className="empty-state">
            <HelpCircle className="empty-icon" />
            <p>还没有问答，快来添加第一个吧！</p>
          </div>
        ) : (
          <div className="qa-list">
            <AnimatePresence>
              {qaPairs.map((qa, index) => (
                <motion.div
                  key={qa.id}
                  className="qa-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="qa-question">
                    <h3 className="question-text">Q: {qa.q}</h3>
                  </div>
                  <div className="qa-answer">
                    <p className="answer-text">A: {qa.a}</p>
                  </div>
                  <div className="qa-footer">
                    <span className="qa-date">{formatTime(qa.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* 添加问答模态框 */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="add-qa-modal"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>添加问答</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="add-qa-form">
                <div className="form-group">
                  <label htmlFor="question">问题</label>
                  <textarea
                    id="question"
                    className="input"
                    placeholder="输入问题..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={3}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="answer">答案</label>
                  <textarea
                    id="answer"
                    className="input"
                    placeholder="输入答案..."
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={4}
                    maxLength={500}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    <Send className="btn-icon" />
                    {submitting ? '添加中...' : '添加问答'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QAndA
