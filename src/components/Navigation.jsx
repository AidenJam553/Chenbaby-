import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Image, HelpCircle, Home, Gamepad2, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Navigation.css'

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth()
  
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/messages', label: '留言板', icon: MessageCircle },
    { path: '/photos', label: '相册', icon: Image },
    { path: '/qa', label: '你问我答', icon: HelpCircle },
    { path: '/game', label: '小游戏', icon: Gamepad2 }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <motion.div 
          className="nav-brand"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart className="nav-logo heart-beat" />
          <span className="nav-title">小琛的温馨小屋</span>
        </motion.div>
        
        <div className="nav-links">
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
