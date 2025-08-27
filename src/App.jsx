import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import MessageBoard from './pages/MessageBoard'
import PhotoAlbum from './pages/PhotoAlbum'
import QAndA from './pages/QAndA'
import Game from './pages/Game'
import './styles/App.css'

function App() {
  console.log('App component loaded successfully')
  
  return (
    <div className="app">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="app-container"
      >
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/messages" element={<MessageBoard />} />
            <Route path="/photos" element={<PhotoAlbum />} />
            <Route path="/qa" element={<QAndA />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </main>
      </motion.div>
    </div>
  )
}

export default App
