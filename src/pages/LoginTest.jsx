import React, { useState } from 'react'
import { authAPI } from '../utils/supabase'

const LoginTest = () => {
  const [testResult, setTestResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [manualUsername, setManualUsername] = useState('')
  const [manualPassword, setManualPassword] = useState('')

  const testLogin = async (username, password) => {
    setIsLoading(true)
    setTestResult('')
    
    try {
      console.log(`测试登录: ${username} / ${password}`)
      console.log('用户名类型:', typeof username, '长度:', username.length)
      console.log('密码类型:', typeof password, '长度:', password.length)
      
      const result = await authAPI.login(username, password)
      
      if (result) {
        setTestResult(`✅ 登录成功! 用户信息: ${JSON.stringify(result, null, 2)}`)
      } else {
        setTestResult(`❌ 登录失败: 用户名或密码错误\n\n请检查浏览器控制台的详细调试信息`)
      }
    } catch (error) {
      setTestResult(`❌ 登录错误: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>登录功能测试</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>测试账号1 - 琛宝</h3>
        <button 
          onClick={() => testLogin('chenchen', 'chenbao123')}
          disabled={isLoading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          测试 chenchen / chenbao123
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>测试账号2 - 涵宝</h3>
        <button 
          onClick={() => testLogin('Jacob', 'hanbao123')}
          disabled={isLoading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          测试 Jacob / hanbao123
        </button>
      </div>

      {isLoading && <p>测试中...</p>}
      
      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          border: '1px solid #ddd',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          {testResult}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>手动测试</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>用户名: </label>
          <input 
            type="text" 
            value={manualUsername}
            onChange={(e) => setManualUsername(e.target.value)}
            placeholder="输入用户名"
            style={{ padding: '5px', marginLeft: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>密码: </label>
          <input 
            type="password" 
            value={manualPassword}
            onChange={(e) => setManualPassword(e.target.value)}
            placeholder="输入密码"
            style={{ padding: '5px', marginLeft: '10px' }}
          />
        </div>
        <button 
          onClick={() => testLogin(manualUsername, manualPassword)}
          disabled={isLoading || !manualUsername || !manualPassword}
          style={{ padding: '10px 20px' }}
        >
          测试手动输入
        </button>
      </div>

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h4>当前配置的用户数据:</h4>
        <ul>
          <li>用户名: chenchen, 密码: chenbao123, 显示名: 琛宝</li>
          <li>用户名: Jacob, 密码: hanbao123, 显示名: 涵宝</li>
        </ul>
      </div>
    </div>
  )
}

export default LoginTest
