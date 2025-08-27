import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy, Clock, Star, User, Heart, ArrowLeft } from 'lucide-react'
import { gameAPI } from '../../utils/supabase'
import './MemoryGame.css'

const MemoryGame = ({ onBack }) => {
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showCharacterSelect, setShowCharacterSelect] = useState(true)
  const [bestScore, setBestScore] = useState(null)

  // 游戏卡片数据
  const cardSymbols = ['💖', '🌸', '🎀', '💝', '🦋', '🌺', '💐', '🎈']
  
  // 初始化游戏
  const initializeGame = () => {
    const gameCards = [...cardSymbols, ...cardSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
    
    setCards(gameCards)
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setTime(0)
    setGameStarted(false)
    setGameCompleted(false)
    setShowCharacterSelect(true)
    setSelectedPlayer(null)
  }

  // 选择人物
  const selectCharacter = async (playerName) => {
    setSelectedPlayer(playerName)
    setShowCharacterSelect(false)
    
    // 获取该人物的最佳成绩
    try {
      const best = await gameAPI.getBestScore(playerName)
      setBestScore(best)
    } catch (error) {
      console.error('获取最佳成绩失败:', error)
      setBestScore(null)
    }
  }

  // 开始游戏
  const startGame = () => {
    setGameStarted(true)
  }

  // 处理卡片点击
  const handleCardClick = (cardId) => {
    if (!gameStarted || gameCompleted) return
    
    const card = cards.find(c => c.id === cardId)
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // 更新卡片状态
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    )

    // 如果翻开了两张卡片，检查是否匹配
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1)
      
      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)

      if (firstCard.symbol === secondCard.symbol) {
        // 匹配成功
        setTimeout(() => {
          setMatchedCards(prev => [...prev, firstId, secondId])
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstId || c.id === secondId 
                ? { ...c, isMatched: true }
                : c
            )
          )
          setFlippedCards([])
        }, 500)
      } else {
        // 匹配失败，翻回卡片
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              c.id === firstId || c.id === secondId 
                ? { ...c, isFlipped: false }
                : c
            )
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  // 计时器
  useEffect(() => {
    let interval = null
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTime(time => time + 1)
      }, 1000)
    } else if (!gameStarted || gameCompleted) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted])

  // 检查游戏是否完成
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0 && selectedPlayer) {
      setGameCompleted(true)
      
      // 保存游戏记录到数据库
      const stars = getStarRating(moves)
      gameAPI.saveGameRecord(selectedPlayer, moves, time, stars)
        .then(() => {
          console.log('游戏记录保存成功')
        })
        .catch(error => {
          console.error('保存游戏记录失败:', error)
        })
      
      // 更新最佳成绩
      if (!bestScore || moves < bestScore.moves || (moves === bestScore.moves && time < bestScore.time_seconds)) {
        const newBestScore = { moves, time_seconds: time, stars }
        setBestScore(newBestScore)
      }
    }
  }, [matchedCards.length, cards.length, moves, time, bestScore, selectedPlayer])

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取星级评分
  const getStarRating = (moves) => {
    if (moves <= 16) return 3
    if (moves <= 24) return 2
    return 1
  }

  useEffect(() => {
    initializeGame()
  }, [])

  return (
    <div className="memory-game">
      {/* 返回按钮 */}
      <motion.button
        className="back-btn"
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft className="back-icon" />
        返回游戏选择
      </motion.button>

      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          记忆翻牌游戏
        </h1>
        <p className="page-subtitle">考验你的记忆力，宝贝！找到所有相同的卡片！</p>
      </motion.div>

      {/* 人物选择界面 */}
      <AnimatePresence>
        {showCharacterSelect && (
          <motion.div
            className="character-select-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="character-select-content">
              <h3>选择你的角色</h3>
              <div className="character-options">
                <motion.button
                  className="character-btn chen-bao"
                  onClick={() => selectCharacter('琛宝')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="character-icon" />
                  <span className="character-name">琛宝</span>
                  <span className="character-desc">聪明可爱的小宝贝</span>
                </motion.button>
                <motion.button
                  className="character-btn han-bao"
                  onClick={() => selectCharacter('涵宝')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="character-icon" />
                  <span className="character-name">涵宝</span>
                  <span className="character-desc">是琛宝的涵宝</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 游戏统计 */}
      {!showCharacterSelect && (
        <motion.div
          className="game-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="stat-item player-info">
            <User className="stat-icon" />
            <span className="stat-label">角色</span>
            <span className="stat-value">{selectedPlayer}</span>
          </div>
          <div className="stat-item">
            <Clock className="stat-icon" />
            <span className="stat-label">时间</span>
            <span className="stat-value">{formatTime(time)}</span>
          </div>
          <div className="stat-item">
            <RotateCcw className="stat-icon" />
            <span className="stat-label">步数</span>
            <span className="stat-value">{moves}</span>
          </div>
          {bestScore && (
            <div className="stat-item best-score">
              <Trophy className="stat-icon" />
              <span className="stat-label">最佳</span>
              <span className="stat-value">{bestScore.moves}步</span>
            </div>
          )}
        </motion.div>
      )}

      {/* 游戏控制 */}
      {!showCharacterSelect && (
        <motion.div
          className="game-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {!gameStarted ? (
            <button
              className="btn btn-primary start-btn"
              onClick={startGame}
            >
              开始游戏
            </button>
          ) : (
            <button
              className="btn btn-secondary restart-btn"
              onClick={initializeGame}
            >
              重新开始
            </button>
          )}
        </motion.div>
      )}

      {/* 游戏完成提示 */}
      <AnimatePresence>
        {gameCompleted && (
          <motion.div
            className="game-complete-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="complete-content">
              <Trophy className="complete-icon" />
              <h3>恭喜{selectedPlayer}完成！</h3>
              <div className="complete-stats">
                <p>用时: {formatTime(time)}</p>
                <p>步数: {moves}</p>
                <div className="star-rating">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      key={i}
                      className={`star ${i < getStarRating(moves) ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={initializeGame}
              >
                再玩一次
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 游戏卡片网格 */}
      {!showCharacterSelect && (
        <motion.div
          className="game-board"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
        <div className="cards-grid">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: card.id * 0.05 }}
            >
              <div className="card-inner">
                <div className="card-front">
                  <span className="card-symbol">?</span>
                </div>
                <div className="card-back">
                  <span className="card-symbol">{card.symbol}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </motion.div>
      )}

      {/* 游戏说明 */}
      {!showCharacterSelect && (
        <motion.div
          className="game-instructions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
        <h3>游戏规则</h3>
        <ul>
          <li>点击卡片翻开，找到相同的两张卡片</li>
          <li>匹配成功的卡片会保持翻开状态</li>
          <li>用最少的步数和时间完成所有匹配</li>
          <li>获得3星需要16步以内，2星需要24步以内</li>
        </ul>
        </motion.div>
      )}
    </div>
  )
}

export default MemoryGame
