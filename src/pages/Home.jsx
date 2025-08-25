import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Image, HelpCircle, Sparkles } from 'lucide-react'
import './Home.css'

const Home = () => {
  console.log('Home component loaded')
  
  const features = [
    {
      icon: MessageCircle,
      title: '留言板',
      description: '留下你的心里话，分享美好时光',
      path: '/messages',
      color: '#FF6B9D'
    },
    {
      icon: Image,
      title: '相册',
      description: '记录我们的每一个精彩瞬间',
      path: '/photos',
      color: '#A8E6CF'
    },
    {
      icon: HelpCircle,
      title: '你问我答',
      description: '有趣的互动问答，增进了解',
      path: '/qa',
      color: '#FFB3D1'
    }
  ]

  return (
    <div className="home">
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div
            className="hero-icon"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className="heart-beat" />
          </motion.div>
          <h1 className="hero-title">
            欢迎来到小琛的温馨小屋
            <Sparkles className="sparkle-icon" />
          </h1>
          <p className="hero-subtitle">
            这里是我们专属的小天地，记录每一个美好的瞬间 💕
          </p>
        </div>
      </motion.div>

      <motion.div
        className="features-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="section-title">功能导航</h2>
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.path}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5
                }}
              >
                <Link to={feature.path} className="feature-link">
                  <div 
                    className="feature-icon"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        className="welcome-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="message-card">
          <h3>💝 温馨提醒</h3>
          <p>
            这里是我们的小天地，可以自由地分享心情、上传照片、互动问答。
            希望这里能成为我们美好回忆的见证者！
          </p>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#718096' }}>
            💡 提示：目前使用模拟数据，配置 Supabase 后可实现真实数据存储
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Home
