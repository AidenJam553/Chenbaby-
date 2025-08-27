import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react'
import './QixiChat.css'

const QixiChat = ({ onBack }) => {
  const [currentScene, setCurrentScene] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)

  // 七夕对话场景数据
  const scenes = [
    {
      id: 0,
      title: "七夕的夜晚",
      character: "琛宝",
      avatar: "💖",
      message: "今天是七夕节呢，涵宝有什么想对我说的吗？",
      options: [
        { text: "当然有啦，我想对你说...", nextScene: 1 },
        { text: "让我想想...", nextScene: 2 }
      ]
    },
    {
      id: 1,
      title: "甜蜜的回应",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，遇见你是我最幸运的事情。每一天都因为有你在身边而变得特别美好。",
      options: [
        { text: "我也是，涵宝...", nextScene: 3 },
        { text: "谢谢你一直陪伴着我", nextScene: 4 }
      ]
    },
    {
      id: 2,
      title: "思考中",
      character: "涵宝",
      avatar: "🌸",
      message: "嗯...我想说，虽然我们在一起的时间不算很长，但每一刻都让我感到幸福。",
      options: [
        { text: "我也是这样想的", nextScene: 5 },
        { text: "希望我们能一直这样下去", nextScene: 6 }
      ]
    },
    {
      id: 3,
      title: "深情的告白",
      character: "琛宝",
      avatar: "💖",
      message: "涵宝，我想对你说，无论未来会遇到什么，我都想和你一起面对。你愿意吗？",
      options: [
        { text: "我愿意！", nextScene: 7 },
        { text: "当然愿意，琛宝", nextScene: 8 }
      ]
    },
    {
      id: 4,
      title: "感谢与承诺",
      character: "琛宝",
      avatar: "💖",
      message: "涵宝，谢谢你选择了我。我承诺会好好珍惜你，让每一天都充满爱意。",
      options: [
        { text: "我相信你，琛宝", nextScene: 9 },
        { text: "我们一定会很幸福的", nextScene: 10 }
      ]
    },
    {
      id: 5,
      title: "共同的感受",
      character: "琛宝",
      avatar: "💖",
      message: "涵宝，我们真的很合拍呢。和你在一起的每一秒，我都觉得时间过得太快了。",
      options: [
        { text: "我也是这样觉得的", nextScene: 11 },
        { text: "希望时间能慢一点", nextScene: 12 }
      ]
    },
    {
      id: 6,
      title: "美好的愿望",
      character: "琛宝",
      avatar: "💖",
      message: "涵宝，我希望我们能一起走过很多个七夕，一起看很多次星星，一起创造更多美好的回忆。",
      options: [
        { text: "我也希望这样", nextScene: 13 },
        { text: "我们一定会实现的", nextScene: 14 }
      ]
    },
    {
      id: 7,
      title: "幸福的拥抱",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我愿意！我愿意和你一起面对所有的挑战，一起分享所有的快乐！",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    },
    {
      id: 8,
      title: "甜蜜的约定",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我当然愿意！我们要一直在一起，永远不分开！",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    },
    {
      id: 9,
      title: "信任的力量",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我相信你，也相信我们的爱情。让我们一起努力，创造属于我们的幸福！",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    },
    {
      id: 10,
      title: "幸福的未来",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我们一定会很幸福的！因为有你在身边，每一天都是情人节！",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    },
    {
      id: 11,
      title: "心有灵犀",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我们真的很有默契呢！和你在一起的时候，时间总是过得特别快。",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    },
    {
      id: 12,
      title: "珍惜时光",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我也希望时间能慢一点，这样我们就能有更多时间在一起了。",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    },
    {
      id: 13,
      title: "共同的梦想",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我也希望我们能一起走过很多个七夕，一起看很多次星星！",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    },
    {
      id: 14,
      title: "美好的承诺",
      character: "涵宝",
      avatar: "🌸",
      message: "琛宝，我们一定会实现的！我们要一起创造更多美好的回忆！",
      options: [
        { text: "重新开始对话", nextScene: 0 },
        { text: "结束对话", nextScene: -1 }
      ]
    }
  ]

  const currentSceneData = scenes.find(scene => scene.id === currentScene)

  const handleOptionClick = (option) => {
    setSelectedOption(option.text)
    
    setTimeout(() => {
      if (option.nextScene === -1) {
        onBack()
      } else {
        setCurrentScene(option.nextScene)
        setSelectedOption(null)
      }
    }, 1000)
  }

  const resetChat = () => {
    setCurrentScene(0)
    setSelectedOption(null)
  }

  return (
    <div className="qixi-chat">
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
        className="chat-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 标题 */}
        <div className="chat-header">
          <h1 className="chat-title">
            <Heart className="title-icon" />
            七夕的对话
          </h1>
          <p className="chat-subtitle">体验琛宝和涵宝的甜蜜对话 💕</p>
        </div>

        {/* 对话场景 */}
        <div className="chat-scene">
          <div className="scene-title">{currentSceneData?.title}</div>
          
          <motion.div
            className="message-bubble"
            key={currentScene}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="character-info">
              <span className="character-avatar">{currentSceneData?.avatar}</span>
              <span className="character-name">{currentSceneData?.character}</span>
            </div>
            <div className="message-text">{currentSceneData?.message}</div>
          </motion.div>

          {/* 选项按钮 */}
          <div className="options-container">
            {currentSceneData?.options.map((option, index) => (
              <motion.button
                key={index}
                className={`option-btn ${selectedOption === option.text ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="option-icon" />
                {option.text}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 重置按钮 */}
        <motion.button
          className="reset-btn"
          onClick={resetChat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          重新开始对话
        </motion.button>
      </motion.div>
    </div>
  )
}

export default QixiChat
