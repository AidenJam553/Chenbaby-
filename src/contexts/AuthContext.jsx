import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化时检查本地存储的登录状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('xiaowu_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          // 验证用户数据结构是否完整
          if (userData && userData.username && userData.display_name) {
            setUser(userData)
          } else {
            console.log('用户数据格式不完整，清除localStorage')
            localStorage.removeItem('xiaowu_user')
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error)
        localStorage.removeItem('xiaowu_user')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (username, password) => {
    try {
      setIsLoading(true)
      const userData = await authAPI.login(username, password)
      if (userData) {
        setUser(userData)
        localStorage.setItem('xiaowu_user', JSON.stringify(userData))
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('xiaowu_user')
  }

  const updateUser = async (newUserData) => {
    try {
      const updatedUser = await authAPI.updateUser(user.username, newUserData)
      if (updatedUser) {
        setUser(updatedUser)
        localStorage.setItem('xiaowu_user', JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return false
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
