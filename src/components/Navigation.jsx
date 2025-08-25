import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Image, HelpCircle, Home } from 'lucide-react'
import './Navigation.css'

const Navigation = () => {
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/messages', label: '留言板', icon: MessageCircle },
    { path: '/photos', label: '相册', icon: Image },
    { path: '/qa', label: '你问我答', icon: HelpCircle }
  ]

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
      </div>
    </nav>
  )
}

export default Navigation
