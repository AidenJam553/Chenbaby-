import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Heart, MessageCircle, Play } from 'lucide-react'
import MemoryGame from './games/MemoryGame'
import QixiChat from './games/QixiChat'
import './Game.css'

const Game = () => {
  const [currentGame, setCurrentGame] = useState(null)

  const games = [
    {
      id: 'memory',
      title: '记忆翻牌',
      description: '宝贝和我一起找到所有相同的卡片！',
      icon: Heart,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      component: MemoryGame
    },
    {
      id: 'qixi',
      title: '七夕的对话',
      description: '没想好，先随便弄一个！',
      icon: MessageCircle,
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a8edea 100%)',
      component: QixiChat
    }
  ]

  const handleGameSelect = (game) => {
    setCurrentGame(game)
  }

  const handleBackToGames = () => {
    setCurrentGame(null)
  }

  // 如果选择了游戏，渲染对应的游戏组件
  if (currentGame) {
    const GameComponent = currentGame.component
    return <GameComponent onBack={handleBackToGames} />
  }

  return (
    <div className="game-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          <Gamepad2 className="title-icon" />
          小游戏中心
        </h1>
        <p className="page-subtitle">哈哈哈哈哈哈我也不知道我为什么要整个小游戏中心！🎮</p>
      </motion.div>

      {/* 游戏选择网格 */}
      <motion.div
        className="games-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {games.map((game, index) => {
          const Icon = game.icon
          return (
            <motion.div
              key={game.id}
              className="game-card"
              style={{ background: game.color }}
              onClick={() => handleGameSelect(game)}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="game-card-content">
                <div className="game-icon">
                  <Icon className="icon" />
                </div>
                <h3 className="game-title">{game.title}</h3>
                <p className="game-description">{game.description}</p>
                <div className="play-button">
                  <Play className="play-icon" />
                  <span>开始游戏</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* 更多游戏提示 */}
      <motion.div
        className="coming-soon"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3>更多精彩游戏即将上线！</h3>
        <p>敬请期待更多有趣的游戏内容 🎯</p>
      </motion.div>
    </div>
  )
}

export default Game
