import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'

console.log('Starting application...')

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
  
  console.log('Application rendered successfully')
} catch (error) {
  console.error('Failed to render application:', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1>😅 应用加载失败</h1>
      <p>错误信息: ${error.message}</p>
      <p>请刷新页面重试</p>
    </div>
  `
}
