import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import MessageBoard from './pages/MessageBoard'
import PhotoAlbum from './pages/PhotoAlbum'
import QAndA from './pages/QAndA'
import Game from './pages/Game'
import Login from './pages/Login'
import Settings from './pages/Settings'
import LoginTest from './pages/LoginTest'
import './styles/App.css'

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">💕</div>
        <p>加载中...</p>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// 主应用组件
const AppContent = () => {
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
            <Route path="/login" element={<Login />} />
            <Route path="/login-test" element={<LoginTest />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessageBoard />
              </ProtectedRoute>
            } />
            <Route path="/photos" element={
              <ProtectedRoute>
                <PhotoAlbum />
              </ProtectedRoute>
            } />
            <Route path="/qa" element={
              <ProtectedRoute>
                <QAndA />
              </ProtectedRoute>
            } />
            <Route path="/game" element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </motion.div>
    </div>
  )
}

function App() {
  console.log('App component loaded successfully')
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
