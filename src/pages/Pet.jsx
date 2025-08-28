import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Fish, Coffee, Gamepad2, Moon } from 'lucide-react'
import './Pet.css'

const Pet = () => {
  const [catState, setCatState] = useState('idle') // idle, happy, eating, playing, sleeping
  const [catMood, setCatMood] = useState(50) // 0-100, affects cat behavior
  const [catEnergy, setCatEnergy] = useState(80) // 0-100
  const [catHunger, setCatHunger] = useState(30) // 0-100
  const [showMessage, setShowMessage] = useState('')
  const [lastInteraction, setLastInteraction] = useState(Date.now())

  // Auto-decrease stats over time
  useEffect(() => {
    const interval = setInterval(() => {
      setCatHunger(prev => Math.min(100, prev + 1))
      setCatEnergy(prev => Math.max(0, prev - 0.5))
      setCatMood(prev => {
        if (catHunger > 80) return Math.max(0, prev - 2)
        if (catEnergy < 20) return Math.max(0, prev - 1)
        return Math.max(0, prev - 0.2)
      })
    }, 5000) // Every 5 seconds

    return () => clearInterval(interval)
  }, [catHunger, catEnergy])

  // Auto state changes based on stats
  useEffect(() => {
    if (catEnergy < 20 && catState !== 'sleeping') {
      setCatState('sleeping')
      showTemporaryMessage('小猫累了，正在睡觉... 💤')
    } else if (catState === 'sleeping' && catEnergy > 50) {
      setCatState('idle')
      showTemporaryMessage('小猫醒来了！👀')
    }
  }, [catEnergy, catState])

  const showTemporaryMessage = (message) => {
    setShowMessage(message)
    setTimeout(() => setShowMessage(''), 3000)
  }

  const handleCatClick = () => {
    if (catState === 'sleeping') {
      showTemporaryMessage('嘘... 小猫在睡觉，不要打扰它 😴')
      return
    }

    const now = Date.now()
    if (now - lastInteraction < 1000) return // Prevent spam clicking

    setLastInteraction(now)
    setCatState('happy')
    setCatMood(prev => Math.min(100, prev + 5))
    
    const messages = [
      '喵~ 你好！😊',
      '小猫很开心见到你！💕',
      '喵喵~ 摸摸我！🐾',
      '你是我最好的朋友！✨',
      '喵~ 继续陪我玩吧！🎈'
    ]
    
    showTemporaryMessage(messages[Math.floor(Math.random() * messages.length)])
    
    setTimeout(() => {
      if (catState === 'happy') setCatState('idle')
    }, 2000)
  }

  const feedCat = () => {
    if (catState === 'sleeping') {
      showTemporaryMessage('小猫在睡觉，稍后再喂食吧 😴')
      return
    }

    if (catHunger < 20) {
      showTemporaryMessage('小猫现在不饿哦~ 😸')
      return
    }

    setCatState('eating')
    setCatHunger(prev => Math.max(0, prev - 30))
    setCatMood(prev => Math.min(100, prev + 10))
    showTemporaryMessage('喵~ 真好吃！谢谢你！😋')
    
    setTimeout(() => {
      setCatState('idle')
    }, 3000)
  }

  const playCat = () => {
    if (catState === 'sleeping') {
      showTemporaryMessage('小猫在睡觉，让它休息一会儿吧 😴')
      return
    }

    if (catEnergy < 30) {
      showTemporaryMessage('小猫太累了，需要休息 😴')
      return
    }

    setCatState('playing')
    setCatEnergy(prev => Math.max(0, prev - 15))
    setCatMood(prev => Math.min(100, prev + 15))
    showTemporaryMessage('喵~ 好好玩！我们一起玩吧！🎉')
    
    setTimeout(() => {
      setCatState('idle')
    }, 4000)
  }

  const letCatRest = () => {
    if (catState === 'sleeping') {
      showTemporaryMessage('小猫已经在睡觉了 😴')
      return
    }

    setCatState('sleeping')
    showTemporaryMessage('小猫开始睡觉了... 晚安 🌙')
  }

  const getStatColor = (value) => {
    if (value > 70) return '#4ade80'
    if (value > 40) return '#fbbf24'
    return '#ef4444'
  }

  return (
    <div className="pet-container">
      {/* 月亮 */}
      <div className="moon"></div>
      
      <motion.div 
        className="pet-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Heart className="pet-icon" />
        <h1>小猫咪叫啥？</h1>
        <p>功能尚未完善，宝贝敬请期待</p>
      </motion.div>

      <div className="pet-main">
        {/* Cat stats */}
        <motion.div 
          className="cat-stats"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="stat-item">
            <span className="stat-label">心情</span>
            <div className="stat-bar">
              <motion.div 
                className="stat-fill"
                style={{ backgroundColor: getStatColor(catMood) }}
                initial={{ width: 0 }}
                animate={{ width: `${catMood}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="stat-value">{Math.round(catMood)}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">精力</span>
            <div className="stat-bar">
              <motion.div 
                className="stat-fill"
                style={{ backgroundColor: getStatColor(catEnergy) }}
                initial={{ width: 0 }}
                animate={{ width: `${catEnergy}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="stat-value">{Math.round(catEnergy)}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">饥饿</span>
            <div className="stat-bar">
              <motion.div 
                className="stat-fill"
                style={{ backgroundColor: getStatColor(100 - catHunger) }}
                initial={{ width: 0 }}
                animate={{ width: `${catHunger}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="stat-value">{Math.round(catHunger)}</span>
          </div>
        </motion.div>

        {/* Cat display */}
        <motion.div 
          className="cat-display"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div 
            className={`cat ${catState}`}
            onClick={handleCatClick}
          >
            {/* Cat tail */}
            <div className="cat__tail"></div>
            
            {/* Cat head */}
            <div className="cat__head"></div>
            
            {/* Cat legs */}
            <div className="cat__leg cat__leg--1"></div>
            <div className="cat__leg cat__leg--2"></div>
            <div className="cat__leg cat__leg--3"></div>
            <div className="cat__leg cat__leg--4"></div>
          </div>

          <AnimatePresence>
            {showMessage && (
              <motion.div 
                className="cat-message"
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {showMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action buttons */}
        <motion.div 
          className="cat-actions"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.button 
            className="action-button feed"
            onClick={feedCat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={catState === 'eating'}
          >
            <Fish className="action-icon" />
            <span>喂食</span>
          </motion.button>

          <motion.button 
            className="action-button play"
            onClick={playCat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={catState === 'playing' || catEnergy < 30}
          >
            <Gamepad2 className="action-icon" />
            <span>玩耍</span>
          </motion.button>

          <motion.button 
            className="action-button rest"
            onClick={letCatRest}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={catState === 'sleeping'}
          >
            <Moon className="action-icon" />
            <span>休息</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Status indicator */}
      <motion.div 
        className="cat-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <span className="status-text">
          当前状态: <strong>{
            catState === 'idle' ? '休息中' :
            catState === 'happy' ? '开心' :
            catState === 'eating' ? '用餐中' :
            catState === 'playing' ? '玩耍中' :
            catState === 'sleeping' ? '睡觉中' : '未知'
          }</strong>
        </span>
      </motion.div>
    </div>
  )
}

export default Pet