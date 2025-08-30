import { createClient } from '@supabase/supabase-js'

// 这些值需要从 Supabase 项目设置中获取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// 检查环境变量是否配置
const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseUrl.includes('supabase.co')

// 添加调试信息
console.log('Supabase 配置信息:')
console.log('URL:', supabaseUrl)
console.log('Key 长度:', supabaseAnonKey.length)
console.log('是否已配置:', isConfigured)

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// 数据库表名
export const TABLES = {
  MESSAGES: 'messages',
  PHOTOS: 'photos',
  QUESTIONS: 'questions',
  GAME_RECORDS: 'game_records',
  USERS: 'users'
}

// 模拟数据（当 Supabase 未配置时使用）
const mockMessages = [
  {
    id: 1,
    name: '小琛',
    text: '欢迎来到我们的温馨小屋！💕',
    likes: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: '小可爱',
    text: '这里真是一个温暖的地方呢～',
    likes: 3,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
]

const mockPhotos = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop',
    tag: '温馨时光',
    uploaded_by: '琛宝',
    user_id: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop',
    tag: '美好回忆',
    uploaded_by: '涵宝',
    user_id: 2,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

const mockQuestions = [
  {
    id: 1,
    question: '我最喜欢的宠物是什么？',
    option_a: '小猫',
    option_b: '小狗',
    option_c: '小兔子',
    correct_answer: 'a',
    created_by: 'chenchen',
    created_by_name: '琛宝',
    answered_by: null,
    user_answer: null,
    is_correct: null,
    answered_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    question: '我们第一次约会去了哪里？',
    option_a: '咖啡厅',
    option_b: '公园',
    option_c: '电影院',
    correct_answer: 'b',
    created_by: 'Jacob',
    created_by_name: '涵宝',
    answered_by: 'chenchen',
    user_answer: 'b',
    is_correct: true,
    answered_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

// 统计数据模拟
const mockStats = {
  chenchen: {
    questions_asked: 1,
    questions_answered: 1,
    correct_answers: 1
  },
  Jacob: {
    questions_asked: 1,
    questions_answered: 0,
    correct_answers: 0
  }
}

const mockGameRecords = [
  {
    id: 1,
    player_name: '琛宝',
    moves: 18,
    time_seconds: 45,
    stars: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    player_name: '涵宝',
    moves: 14,
    time_seconds: 38,
    stars: 3,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
]

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    username: 'chenchen',
    password: 'chenbao123',
    display_name: '琛宝',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'Jacob',
    password: 'hanbao123',
    display_name: '涵宝',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// 消息相关操作
export const messageAPI = {
  // 获取所有消息（包含回复）
  async getMessages() {
    if (!isConfigured) {
      console.log('使用模拟数据：获取留言')
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      // 为模拟数据添加回复示例
      if (mockMessages.length > 0 && !mockMessages.some(m => m.reply_to)) {
        mockMessages.push({
          id: Date.now() + 1,
          name: '涵宝',
          text: '谢谢琛宝的欢迎！我也很喜欢这里💖',
          likes: 2,
          reply_to: mockMessages[0].id,
          created_at: new Date(Date.now() - 1800000).toISOString()
        })
      }
      return mockMessages
    }
    
    try {
      console.log('尝试从 Supabase 获取留言...')
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase 获取留言错误:', error)
        throw error
      }
      
      console.log('成功从 Supabase 获取留言:', data)
      return data
    } catch (error) {
      console.error('获取留言失败:', error)
      return mockMessages
    }
  },

  // 添加新消息
  async addMessage(name, text, replyTo = null) {
    if (!isConfigured) {
      console.log('使用模拟数据：添加留言')
      const newMessage = {
        id: Date.now(),
        name,
        text,
        likes: 0,
        reply_to: replyTo,
        created_at: new Date().toISOString()
      }
      mockMessages.unshift(newMessage)
      return newMessage
    }

    try {
      console.log('尝试添加留言到 Supabase...')
      const messageData = { name, text }
      if (replyTo) {
        messageData.reply_to = replyTo
      }
      
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .insert([messageData])
        .select()
      
      if (error) {
        console.error('Supabase 添加留言错误:', error)
        throw error
      }
      
      console.log('成功添加留言到 Supabase:', data[0])
      return data[0]
    } catch (error) {
      console.error('添加留言失败:', error)
      throw error
    }
  },

  // 添加回复
  async addReply(name, text, parentMessageId) {
    return this.addMessage(name, text, parentMessageId)
  },

  // 获取留言的回复
  async getReplies(messageId) {
    if (!isConfigured) {
      console.log('使用模拟数据：获取回复')
      const replies = mockMessages.filter(m => m.reply_to === messageId)
      return replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }

    try {
      console.log('尝试从 Supabase 获取回复...')
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .eq('reply_to', messageId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Supabase 获取回复错误:', error)
        throw error
      }
      
      console.log('成功从 Supabase 获取回复:', data)
      return data
    } catch (error) {
      console.error('获取回复失败:', error)
      return []
    }
  },

  // 点赞消息
  async likeMessage(id) {
    if (!isConfigured) {
      console.log('使用模拟数据：点赞留言')
      const message = mockMessages.find(m => m.id === id)
      if (message) {
        message.likes = (message.likes || 0) + 1
      }
      return message
    }

    try {
      console.log('尝试在 Supabase 中点赞留言...')
      
      // 先获取当前的点赞数
      const { data: currentMessage, error: selectError } = await supabase
        .from(TABLES.MESSAGES)
        .select('likes')
        .eq('id', id)
        .single()
      
      if (selectError) {
        console.error('获取留言失败:', selectError)
        throw selectError
      }
      
      // 更新点赞数
      const newLikes = (currentMessage.likes || 0) + 1
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .update({ likes: newLikes })
        .eq('id', id)
        .select()
      
      if (error) {
        console.error('Supabase 点赞错误:', error)
        throw error
      }
      
      console.log('成功在 Supabase 中点赞留言:', data[0])
      return data[0]
    } catch (error) {
      console.error('点赞失败:', error)
      throw error
    }
  }
}

// 照片相关操作
export const photoAPI = {
  // 获取所有照片
  async getPhotos() {
    if (!isConfigured) {
      console.log('使用模拟数据：获取照片')
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockPhotos
    }

    try {
      console.log('尝试从 Supabase 获取照片...')
      const { data, error } = await supabase
        .from(TABLES.PHOTOS)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase 获取照片错误:', error)
        throw error
      }
      
      console.log('成功从 Supabase 获取照片:', data)
      return data
    } catch (error) {
      console.error('获取照片失败:', error)
      return mockPhotos
    }
  },

  // 添加新照片
  async addPhoto(url, tag = '', uploadedBy = '', userId = null) {
    if (!isConfigured) {
      console.log('使用模拟数据：添加照片')
      const newPhoto = {
        id: Date.now(),
        url,
        tag,
        uploaded_by: uploadedBy,
        user_id: userId,
        created_at: new Date().toISOString()
      }
      mockPhotos.unshift(newPhoto)
      return newPhoto
    }

    try {
      console.log('尝试添加照片到 Supabase...')
      const { data, error } = await supabase
        .from(TABLES.PHOTOS)
        .insert([{ url, tag, uploaded_by: uploadedBy, user_id: userId }])
        .select()
      
      if (error) {
        console.error('Supabase 添加照片错误:', error)
        throw error
      }
      
      console.log('成功添加照片到 Supabase:', data[0])
      return data[0]
    } catch (error) {
      console.error('添加照片失败:', error)
      throw error
    }
  },

  // 删除照片
  async deletePhoto(photoId, userId) {
    if (!isConfigured) {
      console.log('使用模拟数据：删除照片')
      const photoIndex = mockPhotos.findIndex(p => p.id === photoId)
      if (photoIndex !== -1) {
        const photo = mockPhotos[photoIndex]
        // 检查是否为照片上传者
        if (photo.user_id !== userId) {
          throw new Error('只能删除自己上传的照片')
        }
        mockPhotos.splice(photoIndex, 1)
        return true
      }
      return false
    }

    try {
      console.log('尝试从 Supabase 删除照片...')
      
      // 先查询照片确保存在
      const { data: photo, error: selectError } = await supabase
        .from(TABLES.PHOTOS)
        .select('*')
        .eq('id', photoId)
        .single()
      
      if (selectError || !photo) {
        console.error('照片不存在:', selectError)
        throw new Error('照片不存在')
      }
      
      console.log('找到照片:', photo)
      
      // 删除照片记录
      const { error: deleteError } = await supabase
        .from(TABLES.PHOTOS)
        .delete()
        .eq('id', photoId)
      
      if (deleteError) {
        console.error('Supabase 删除照片错误:', deleteError)
        throw deleteError
      }
      
      console.log('成功从 Supabase 删除照片')
      return true
    } catch (error) {
      console.error('删除照片失败:', error)
      throw error
    }
  },

  // 上传文件到存储
  async uploadFile(file, path) {
    if (!isConfigured) {
      throw new Error('Supabase 未配置，无法上传文件')
    }

    try {
      console.log('尝试上传文件到 Supabase Storage...')
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(path, file)
      
      if (error) {
        console.error('Supabase 文件上传错误:', error)
        throw error
      }
      
      console.log('成功上传文件到 Supabase Storage:', data)
      return data
    } catch (error) {
      console.error('上传文件失败:', error)
      throw error
    }
  },

  // 获取文件公共URL
  getPublicUrl(path) {
    if (!isConfigured) {
      return `https://placeholder.supabase.co/storage/v1/object/public/photos/${path}`
    }

    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}

// 问答相关操作
export const qaAPI = {
  // 获取所有问题
  async getQuestions() {
    if (!isConfigured) {
      console.log('使用模拟数据：获取问题')
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockQuestions
    }

    try {
      console.log('尝试从 Supabase 获取问题...')
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase 获取问题错误:', error)
        throw error
      }
      
      console.log('成功从 Supabase 获取问题:', data)
      return data
    } catch (error) {
      console.error('获取问题失败:', error)
      return mockQuestions
    }
  },

  // 添加新问题
  async addQuestion(questionData) {
    if (!isConfigured) {
      console.log('使用模拟数据：添加问题')
      const newQuestion = {
        id: Date.now(),
        ...questionData,
        answered_by: null,
        user_answer: null,
        is_correct: null,
        answered_at: null,
        created_at: new Date().toISOString()
      }
      mockQuestions.unshift(newQuestion)
      
      // 更新提问者的统计数据
      if (!mockStats[questionData.created_by]) {
        mockStats[questionData.created_by] = { questions_asked: 0, questions_answered: 0, correct_answers: 0 }
      }
      mockStats[questionData.created_by].questions_asked++
      
      return newQuestion
    }

    try {
      console.log('尝试添加问题到 Supabase...')
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .insert([{
          question: questionData.question,
          option_a: questionData.option_a,
          option_b: questionData.option_b,
          option_c: questionData.option_c,
          correct_answer: questionData.correct_answer,
          created_by: questionData.created_by,
          created_by_name: questionData.created_by_name
        }])
        .select()
      
      if (error) {
        console.error('Supabase 添加问题错误:', error)
        throw error
      }
      
      console.log('成功添加问题到 Supabase:', data[0])
      return data[0]
    } catch (error) {
      console.error('添加问题失败:', error)
      throw error
    }
  },

  // 回答问题
  async answerQuestion(questionId, userAnswer, username, displayName) {
    if (!isConfigured) {
      console.log('使用模拟数据：回答问题')
      const question = mockQuestions.find(q => q.id === questionId)
      if (question && !question.answered_by) {
        const isCorrect = question.correct_answer === userAnswer
        question.answered_by = username
        question.user_answer = userAnswer
        question.is_correct = isCorrect
        question.answered_at = new Date().toISOString()
        
        // 更新统计数据
        if (!mockStats[username]) {
          mockStats[username] = { questions_asked: 0, questions_answered: 0, correct_answers: 0 }
        }
        mockStats[username].questions_answered++
        if (isCorrect) {
          mockStats[username].correct_answers++
        }
        
        return { ...question, is_correct: isCorrect }
      }
      return null
    }

    try {
      console.log('尝试在 Supabase 中回答问题...')
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .update({
          answered_by: username,
          user_answer: userAnswer,
          answered_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .is('answered_by', null)
        .select()
      
      if (error) {
        console.error('Supabase 回答问题错误:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        const question = data[0]
        const isCorrect = question.correct_answer === userAnswer
        
        // 更新问题的正确性
        const { data: updatedData, error: updateError } = await supabase
          .from(TABLES.QUESTIONS)
          .update({ is_correct: isCorrect })
          .eq('id', questionId)
          .select()
        
        if (updateError) {
          console.error('Supabase 更新正确性错误:', updateError)
        }
        
        console.log('成功在 Supabase 中回答问题:', updatedData[0])
        return { ...updatedData[0], is_correct: isCorrect }
      }
      
      return null
    } catch (error) {
      console.error('回答问题失败:', error)
      throw error
    }
  },

  // 获取统计数据
  async getStats(username) {
    if (!isConfigured) {
      console.log('使用模拟数据：获取统计')
      return mockStats[username] || { questions_asked: 0, questions_answered: 0, correct_answers: 0 }
    }

    try {
      console.log('尝试从 Supabase 获取统计...')
      // 获取提问次数
      const { data: askedData, error: askedError } = await supabase
        .from(TABLES.QUESTIONS)
        .select('id')
        .eq('created_by', username)
      
      if (askedError) {
        console.error('Supabase 获取提问统计错误:', askedError)
        throw askedError
      }

      // 获取回答次数和正确次数
      const { data: answeredData, error: answeredError } = await supabase
        .from(TABLES.QUESTIONS)
        .select('is_correct')
        .eq('answered_by', username)
        .not('is_correct', 'is', null)
      
      if (answeredError) {
        console.error('Supabase 获取回答统计错误:', answeredError)
        throw answeredError
      }

      const questionsAsked = askedData.length
      const questionsAnswered = answeredData.length
      const correctAnswers = answeredData.filter(q => q.is_correct).length

      const stats = {
        questions_asked: questionsAsked,
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers
      }
      
      console.log('成功从 Supabase 获取统计:', stats)
      return stats
    } catch (error) {
      console.error('获取统计失败:', error)
      return { questions_asked: 0, questions_answered: 0, correct_answers: 0 }
    }
  },

  // 获取所有用户的统计数据
  async getAllStats() {
    if (!isConfigured) {
      console.log('使用模拟数据：获取所有统计')
      return mockStats
    }

    try {
      console.log('尝试从 Supabase 获取所有统计...')
      // 这里可以根据需要实现获取所有用户统计的逻辑
      return {}
    } catch (error) {
      console.error('获取所有统计失败:', error)
      return {}
    }
  }
}

// 游戏记录相关操作
export const gameAPI = {
  // 获取所有游戏记录
  async getGameRecords() {
    if (!isConfigured) {
      console.log('使用模拟数据：获取游戏记录')
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockGameRecords
    }

    try {
      console.log('尝试从 Supabase 获取游戏记录...')
      const { data, error } = await supabase
        .from(TABLES.GAME_RECORDS)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase 获取游戏记录错误:', error)
        throw error
      }
      
      console.log('成功从 Supabase 获取游戏记录:', data)
      return data
    } catch (error) {
      console.error('获取游戏记录失败:', error)
      return mockGameRecords
    }
  },

  // 保存游戏记录
  async saveGameRecord(playerName, moves, timeSeconds, stars) {
    if (!isConfigured) {
      console.log('使用模拟数据：保存游戏记录')
      const newRecord = {
        id: Date.now(),
        player_name: playerName,
        moves,
        time_seconds: timeSeconds,
        stars,
        created_at: new Date().toISOString()
      }
      mockGameRecords.unshift(newRecord)
      return newRecord
    }

    try {
      console.log('尝试保存游戏记录到 Supabase...')
      const { data, error } = await supabase
        .from(TABLES.GAME_RECORDS)
        .insert([{ 
          player_name: playerName, 
          moves, 
          time_seconds: timeSeconds, 
          stars 
        }])
        .select()
      
      if (error) {
        console.error('Supabase 保存游戏记录错误:', error)
        throw error
      }
      
      console.log('成功保存游戏记录到 Supabase:', data[0])
      return data[0]
    } catch (error) {
      console.error('保存游戏记录失败:', error)
      throw error
    }
  },

  // 获取最佳成绩
  async getBestScore(playerName) {
    if (!isConfigured) {
      console.log('使用模拟数据：获取最佳成绩')
      const playerRecords = mockGameRecords.filter(record => record.player_name === playerName)
      if (playerRecords.length === 0) return null
      
      return playerRecords.reduce((best, current) => {
        if (current.moves < best.moves || (current.moves === best.moves && current.time_seconds < best.time_seconds)) {
          return current
        }
        return best
      })
    }

    try {
      console.log('尝试从 Supabase 获取最佳成绩...')
      const { data, error } = await supabase
        .from(TABLES.GAME_RECORDS)
        .select('*')
        .eq('player_name', playerName)
        .order('moves', { ascending: true })
        .order('time_seconds', { ascending: true })
        .limit(1)
      
      if (error) {
        console.error('Supabase 获取最佳成绩错误:', error)
        throw error
      }
      
      console.log('成功从 Supabase 获取最佳成绩:', data[0] || null)
      return data[0] || null
    } catch (error) {
      console.error('获取最佳成绩失败:', error)
      return null
    }
  }
}

// 用户认证相关操作
export const authAPI = {
  // 用户登录
  async login(username, password) {
    if (!isConfigured) {
      console.log('使用模拟数据：用户登录')
      console.log('输入的用户名:', username)
      console.log('输入的密码:', password)
      console.log('可用的用户数据:', mockUsers)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 详细调试用户匹配过程
      console.log('开始匹配用户...')
      for (let i = 0; i < mockUsers.length; i++) {
        const u = mockUsers[i]
        console.log(`用户${i + 1}:`, {
          username: u.username,
          password: u.password,
          usernameMatch: u.username === username,
          passwordMatch: u.password === password,
          usernameLength: u.username.length,
          inputUsernameLength: username.length,
          passwordLength: u.password.length,
          inputPasswordLength: password.length
        })
      }
      
      const user = mockUsers.find(u => u.username === username && u.password === password)
      console.log('找到的用户:', user)
      
      if (user) {
        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user
        console.log('返回的用户信息:', userWithoutPassword)
        return userWithoutPassword
      }
      console.log('未找到匹配的用户')
      return null
    }

    try {
      console.log('尝试从 Supabase 验证用户...')
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('id, username, display_name, created_at, updated_at')
        .eq('username', username)
        .eq('password', password)
        .single()
      
      if (error) {
        console.error('Supabase 用户验证错误:', error)
        return null
      }
      
      console.log('成功从 Supabase 验证用户:', data)
      return data
    } catch (error) {
      console.error('用户验证失败:', error)
      return null
    }
  },

  // 验证用户凭据
  async validateUser(username, password) {
    if (!isConfigured) {
      console.log('使用模拟数据：验证用户凭据')
      return mockUsers.some(u => u.username === username && u.password === password)
    }

    try {
      console.log('尝试在 Supabase 中验证用户凭据...')
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('id')
        .eq('username', username)
        .eq('password', password)
        .single()
      
      if (error) {
        console.error('Supabase 用户凭据验证错误:', error)
        return false
      }
      
      console.log('成功在 Supabase 中验证用户凭据:', !!data)
      return !!data
    } catch (error) {
      console.error('用户凭据验证失败:', error)
      return false
    }
  },

  // 更新用户信息
  async updateUser(username, updateData) {
    if (!isConfigured) {
      console.log('使用模拟数据：更新用户信息')
      const userIndex = mockUsers.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          ...updateData,
          updated_at: new Date().toISOString()
        }
        const { password: _, ...userWithoutPassword } = mockUsers[userIndex]
        return userWithoutPassword
      }
      return null
    }

    try {
      console.log('尝试在 Supabase 中更新用户信息...')
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('username', username)
        .select('id, username, display_name, created_at, updated_at')
        .single()
      
      if (error) {
        console.error('Supabase 更新用户信息错误:', error)
        return null
      }
      
      console.log('成功在 Supabase 中更新用户信息:', data)
      return data
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return null
    }
  },

  // 获取用户信息
  async getUser(username) {
    if (!isConfigured) {
      console.log('使用模拟数据：获取用户信息')
      const user = mockUsers.find(u => u.username === username)
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
      }
      return null
    }

    try {
      console.log('尝试从 Supabase 获取用户信息...')
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('id, username, display_name, created_at, updated_at')
        .eq('username', username)
        .single()
      
      if (error) {
        console.error('Supabase 获取用户信息错误:', error)
        return null
      }
      
      console.log('成功从 Supabase 获取用户信息:', data)
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }
}
