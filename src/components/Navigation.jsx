import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Image, HelpCircle, Home, Gamepad2, Cat, LogOut, Settings, Menu, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Navigation.css'

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)
  
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/messages', label: '留言板', icon: MessageCircle },
    { path: '/photos', label: '相册', icon: Image },
    { path: '/qa', label: '你问我答', icon: HelpCircle },
    { path: '/game', label: '小游戏', icon: Gamepad2 },
    { path: '/pet', label: 'Pet🐱', icon: Cat }
  ]

  const handleLogout = () => {
    logout()
  }

  const getCurrentPageInfo = () => {
    const currentItem = navItems.find(item => item.path === location.pathname)
    return currentItem || navItems[0]
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMenuOpen])

  // 路由变化时关闭菜单
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-left">
          <NavLink to="/" className="nav-brand-link">
            <motion.div 
              className="nav-brand"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className="nav-logo heart-beat" />
              <span className="nav-title">小琛的温馨小屋</span>
            </motion.div>
          </NavLink>
          
          {/* 移动端导航下拉菜单 - 放在左侧 */}
          <div className="nav-mobile mobile-nav" ref={dropdownRef}>
            <button 
              className="mobile-nav-trigger"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="导航菜单"
            >
              <Menu className="menu-icon" />
              <span className="menu-text">Menu</span>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="mobile-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="dropdown-content">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.path
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={`dropdown-item ${isActive ? 'active' : ''}`}
                          onClick={closeMenu}
                        >
                          <Icon className="nav-icon" />
                          <span className="nav-label">{item.label}</span>
                          {isActive && <div className="active-indicator" />}
                        </NavLink>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* 桌面端导航 */}
        <div className="nav-links desktop-nav">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </motion.div>
            )
          })}
        </div>



        {isAuthenticated && (
          <div className="nav-user">
            <motion.div
              className="user-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <span className="user-name">欢迎，{user?.display_name || user?.username}</span>
            </motion.div>
            
            <motion.div
              className="user-actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <NavLink
                to="/settings"
                className="settings-button"
                title="用户设置"
              >
                <Settings className="settings-icon" />
                <span className="settings-text">设置</span>
              </NavLink>
              
              <motion.button
                className="logout-button"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="退出登录"
              >
                <LogOut className="logout-icon" />
                <span className="logout-text">退出</span>
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
