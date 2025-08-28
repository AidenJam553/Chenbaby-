import React, { useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../utils/supabase'
import './Settings.css'

const Settings = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    username: user?.username || '',
    display_name: user?.display_name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除消息
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setMessage({ type: 'error', text: '用户名不能为空' })
      return false
    }
    
    if (!formData.display_name.trim()) {
      setMessage({ type: 'error', text: '显示名称不能为空' })
      return false
    }

    // 如果要修改密码，需要验证密码
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: '请输入当前密码' })
        return false
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: '新密码和确认密码不匹配' })
        return false
      }
      
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: '新密码长度至少6位' })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // 如果要修改密码，先验证当前密码
      if (formData.newPassword) {
        const isValidPassword = await authAPI.validateUser(user.username, formData.currentPassword)
        if (!isValidPassword) {
          setMessage({ type: 'error', text: '当前密码错误' })
          setIsLoading(false)
          return
        }
      }

      // 准备更新数据
      const updateData = {
        username: formData.username,
        display_name: formData.display_name
      }

      // 如果设置了新密码，添加到更新数据中
      if (formData.newPassword) {
        updateData.password = formData.newPassword
      }

      // 更新用户信息
      const success = await updateUser(updateData)
      
      if (success) {
        setMessage({ type: 'success', text: '设置已保存' })
        // 清空密码字段
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        setMessage({ type: 'error', text: '保存失败，请重试' })
      }
    } catch (error) {
      console.error('保存设置失败:', error)
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="settings-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="settings-card"
      >
        <div className="settings-header">
          <h1>⚙️ 用户设置</h1>
          <p>修改您的用户名和密码</p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-section">
            <h3>基本信息</h3>
            
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="display_name">显示名称</label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="请输入显示名称"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>密码设置</h3>
            <p className="section-description">如需修改密码，请填写以下信息</p>
            
            <div className="form-group">
              <label htmlFor="currentPassword">当前密码</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="请输入当前密码"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">新密码</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="请输入新密码（至少6位）"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">确认新密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入新密码"
                disabled={isLoading}
              />
            </div>
          </div>

          {message.text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`message ${message.type}`}
            >
              {message.text}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="save-button"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? '保存中...' : '保存设置'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default Settings
