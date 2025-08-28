import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Plus, Send, MessageCircle, X, User, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import { qaAPI } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'
import './QAndA.css'

const QAndA = () => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [answering, setAnswering] = useState({})
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState('questions') // 'questions' or 'stats'
  
  const [formData, setFormData] = useState({ 
    question: '', 
    option_a: '', 
    option_b: '', 
    option_c: '', 
    correct_answer: 'a' 
  })

  // 获取问题列表
  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const data = await qaAPI.getQuestions()
      setQuestions(data)
    } catch (error) {
      console.error('获取问题失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const allStats = await qaAPI.getAllStats()
      setStats(allStats)
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  // 提交新问题
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.question.trim() || !formData.option_a.trim() || 
        !formData.option_b.trim() || !formData.option_c.trim()) {
      alert('请填写所有字段')
      return
    }

    try {
      setSubmitting(true)
      const questionData = {
        question: formData.question.trim(),
        option_a: formData.option_a.trim(),
        option_b: formData.option_b.trim(),
        option_c: formData.option_c.trim(),
        correct_answer: formData.correct_answer,
        created_by: user.username,
        created_by_name: user.display_name
      }
      
      await qaAPI.addQuestion(questionData)
      setFormData({ question: '', option_a: '', option_b: '', option_c: '', correct_answer: 'a' })
      setShowAddModal(false)
      fetchQuestions() // 重新获取问题列表
      fetchStats() // 更新统计
    } catch (error) {
      console.error('添加问题失败:', error)
      alert('添加失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 回答问题
  const handleAnswer = async (questionId, answer) => {
    try {
      setAnswering(prev => ({ ...prev, [questionId]: true }))
      const result = await qaAPI.answerQuestion(questionId, answer, user.username, user.display_name)
      
      if (result) {
        // 更新本地状态
        setQuestions(prev => prev.map(q => 
          q.id === questionId ? result : q
        ))
        fetchStats() // 更新统计
      } else {
        alert('回答失败，该问题可能已被回答')
      }
    } catch (error) {
      console.error('回答问题失败:', error)
      alert('回答失败，请重试')
    } finally {
      setAnswering(prev => ({ ...prev, [questionId]: false }))
    }
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 计算正确率
  const calculateAccuracy = (correct, total) => {
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  // 获取选项字母对应的文本
  const getOptionText = (question, optionLetter) => {
    switch (optionLetter) {
      case 'a': return question.option_a
      case 'b': return question.option_b
      case 'c': return question.option_c
      default: return ''
    }
  }

  // 渲染统计卡片
  const renderStatsCard = (username, userStats) => {
    const accuracy = calculateAccuracy(userStats.correct_answers, userStats.questions_answered)
    const userInfo = username === 'chenchen' ? '琛宝' : '涵宝'
    
    return (
      <motion.div
        key={username}
        className="stats-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="stats-header">
          <User className="stats-icon" />
          <h3>{userInfo}</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{userStats.questions_asked}</span>
            <span className="stat-label">提问次数</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userStats.questions_answered}</span>
            <span className="stat-label">答题次数</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userStats.correct_answers}</span>
            <span className="stat-label">答对次数</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{accuracy}%</span>
            <span className="stat-label">正确率</span>
          </div>
        </div>
      </motion.div>
    )
  }

  useEffect(() => {
    fetchQuestions()
    fetchStats()
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
        <p className="page-subtitle">想要更多的了解宝贝 💕🎯</p>
      </motion.div>

      {/* 标签页切换 */}
      <motion.div
        className="tab-switcher"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <MessageCircle className="tab-icon" />
          问答列表
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 className="tab-icon" />
          统计数据
        </button>
      </motion.div>

      {/* 问答列表 */}
      {activeTab === 'questions' && (
        <>
          {/* 添加问题按钮 */}
          <motion.div
            className="add-question-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              className="btn btn-primary add-question-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="btn-icon" />
              出个题目
            </button>
          </motion.div>

          {/* 问题列表 */}
          <motion.div
            className="questions-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>加载中...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="empty-state">
                <HelpCircle className="empty-icon" />
                <p>还没有问题，快来出第一个题目吧！</p>
              </div>
            ) : (
              <div className="questions-list">
                <AnimatePresence>
                  {questions.map((question, index) => {
                    const canAnswer = !question.answered_by && question.created_by !== user.username
                    const isAnswered = !!question.answered_by
                    const isMyQuestion = question.created_by === user.username
                    
                    return (
                      <motion.div
                        key={question.id}
                        className={`question-card ${isAnswered ? 'answered' : ''} ${isMyQuestion ? 'my-question' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {/* 问题头部 */}
                        <div className="question-header">
                          <div className="questioner-info">
                            <User className="questioner-icon" />
                            <span className="questioner-name">{question.created_by_name}</span>
                            <span className="question-time">
                              <Clock className="time-icon" />
                              {formatTime(question.created_at)}
                            </span>
                          </div>
                          {isAnswered && (
                            <div className={`answer-status ${question.is_correct ? 'correct' : 'incorrect'}`}>
                              {question.is_correct ? (
                                <CheckCircle className="status-icon" />
                              ) : (
                                <XCircle className="status-icon" />
                              )}
                              {question.is_correct ? '答对了' : '答错了'}
                            </div>
                          )}
                        </div>

                        {/* 问题内容 */}
                        <div className="question-content">
                          <h3 className="question-text">{question.question}</h3>
                          
                          <div className="options-container">
                            {['a', 'b', 'c'].map(option => (
                              <div
                                key={option}
                                className={`option ${
                                  isAnswered && question.user_answer === option 
                                    ? question.is_correct ? 'correct-answer' : 'wrong-answer'
                                    : ''
                                } ${
                                  isAnswered && question.correct_answer === option && !question.is_correct
                                    ? 'correct-answer show-correct'
                                    : ''
                                }`}
                              >
                                {canAnswer ? (
                                  <button
                                    className="option-btn"
                                    onClick={() => handleAnswer(question.id, option)}
                                    disabled={answering[question.id]}
                                  >
                                    <span className="option-letter">{option.toUpperCase()}.</span>
                                    <span className="option-text">{getOptionText(question, option)}</span>
                                  </button>
                                ) : (
                                  <div className="option-display">
                                    <span className="option-letter">{option.toUpperCase()}.</span>
                                    <span className="option-text">{getOptionText(question, option)}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* 答题结果 */}
                          {isAnswered && (
                            <div className="answer-result">
                              <div className="answerer-info">
                                <span>回答者：{question.answered_by === 'chenchen' ? '琛宝' : '涵宝'}</span>
                                <span className="answer-time">{formatTime(question.answered_at)}</span>
                              </div>
                            </div>
                          )}

                          {/* 等待回答提示 */}
                          {!isAnswered && !canAnswer && isMyQuestion && (
                            <div className="waiting-answer">
                              <MessageCircle className="waiting-icon" />
                              <span>等待对方回答...</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* 统计数据 */}
      {activeTab === 'stats' && (
        <motion.div
          className="stats-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="section-title">答题统计</h2>
          <div className="stats-grid-container">
            {Object.entries(stats).map(([username, userStats]) => 
              renderStatsCard(username, userStats)
            )}
          </div>
          
          {Object.keys(stats).length === 0 && (
            <div className="empty-state">
              <BarChart3 className="empty-icon" />
              <p>还没有统计数据</p>
            </div>
          )}
        </motion.div>
      )}

      {/* 添加问题模态框 */}
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
              className="add-question-modal"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>出个题目</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="add-question-form">
                <div className="form-group">
                  <label htmlFor="question">题目</label>
                  <textarea
                    id="question"
                    className="input"
                    placeholder="输入你的问题..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={3}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="options-form">
                  <div className="form-group">
                    <label htmlFor="option_a">选项A</label>
                    <input
                      id="option_a"
                      type="text"
                      className="input"
                      placeholder="选项A内容"
                      value={formData.option_a}
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="option_b">选项B</label>
                    <input
                      id="option_b"
                      type="text"
                      className="input"
                      placeholder="选项B内容"
                      value={formData.option_b}
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="option_c">选项C</label>
                    <input
                      id="option_c"
                      type="text"
                      className="input"
                      placeholder="选项C内容"
                      value={formData.option_c}
                      onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="correct_answer">正确答案</label>
                  <select
                    id="correct_answer"
                    className="input"
                    value={formData.correct_answer}
                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                  </select>
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
                    {submitting ? '发布中...' : '发布题目'}
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