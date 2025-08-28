import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart } from 'lucide-react'
import './WelcomeModal.css'

const WelcomeModal = ({ show, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideWelcomeModal', 'true')
    }
    onClose()
  }

  const handleDontShowAgainChange = (e) => {
    setDontShowAgain(e.target.checked)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="welcome-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="welcome-modal"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="welcome-modal-header">
              <Heart className="welcome-heart-icon" />
              <h2>七夕节快乐！</h2>
              <button
                className="welcome-close-btn"
                onClick={handleClose}
                aria-label="关闭"
              >
                <X />
              </button>
            </div>

            <div className="welcome-modal-content">
              <div className="welcome-message">
                <p>
                  宝贝琛琛，七夕节快乐！希望你天天都快乐，也希望我能给你带来快乐~
                </p>
                <p>
                  我们在一起第二天就异国了，其实也挺drama的哈哈哈，但你的坚定让我也坚定！
                </p>
                <p>
                  只要住在对方心里，就不怕任何困难。想要了解你更多，想要一直陪伴你~
                </p>
                <p className="welcome-signature">
                  谢谢你，从天而降的天使，我的宝贝♥
                </p>
              </div>
            </div>

            <div className="welcome-modal-footer">
              <div className="welcome-checkbox-container">
                <label className="welcome-checkbox-label">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={handleDontShowAgainChange}
                    className="welcome-checkbox"
                  />
                  <span className="welcome-checkbox-text">下次不再提醒</span>
                </label>
              </div>
              <button
                className="welcome-confirm-btn"
                onClick={handleClose}
              >
                <Heart className="btn-heart-icon" />
                收到啦！
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WelcomeModal
