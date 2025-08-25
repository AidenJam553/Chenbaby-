import { createClient } from '@supabase/supabase-js'

// 这些值需要从 Supabase 项目设置中获取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// 检查环境变量是否配置
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// 数据库表名
export const TABLES = {
  MESSAGES: 'messages',
  PHOTOS: 'photos',
  QA_PAIRS: 'qa_pairs'
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
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop',
    tag: '美好回忆',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

const mockQAPairs = [
  {
    id: 1,
    q: '你最喜欢什么颜色？',
    a: '我最喜欢粉色，因为它很温馨可爱～',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    q: '今天心情怎么样？',
    a: '今天心情很好，因为有你在身边！',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

// 消息相关操作
export const messageAPI = {
  // 获取所有消息
  async getMessages() {
    if (!isConfigured) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockMessages
    }
    
    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('获取留言失败:', error)
      return mockMessages
    }
  },

  // 添加新消息
  async addMessage(name, text) {
    if (!isConfigured) {
      const newMessage = {
        id: Date.now(),
        name,
        text,
        likes: 0,
        created_at: new Date().toISOString()
      }
      mockMessages.unshift(newMessage)
      return newMessage
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .insert([{ name, text }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('添加留言失败:', error)
      throw error
    }
  },

  // 点赞消息
  async likeMessage(id) {
    if (!isConfigured) {
      const message = mockMessages.find(m => m.id === id)
      if (message) {
        message.likes = (message.likes || 0) + 1
      }
      return message
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .update({ likes: supabase.sql`likes + 1` })
        .eq('id', id)
        .select()
      
      if (error) throw error
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
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockPhotos
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.PHOTOS)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('获取照片失败:', error)
      return mockPhotos
    }
  },

  // 添加新照片
  async addPhoto(url, tag = '') {
    if (!isConfigured) {
      const newPhoto = {
        id: Date.now(),
        url,
        tag,
        created_at: new Date().toISOString()
      }
      mockPhotos.unshift(newPhoto)
      return newPhoto
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.PHOTOS)
        .insert([{ url, tag }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('添加照片失败:', error)
      throw error
    }
  },

  // 上传文件到存储
  async uploadFile(file, path) {
    if (!isConfigured) {
      throw new Error('Supabase 未配置，无法上传文件')
    }

    try {
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(path, file)
      
      if (error) throw error
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
  // 获取所有问答对
  async getQAPairs() {
    if (!isConfigured) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockQAPairs
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.QA_PAIRS)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('获取问答失败:', error)
      return mockQAPairs
    }
  },

  // 添加新问答对
  async addQAPair(question, answer) {
    if (!isConfigured) {
      const newQA = {
        id: Date.now(),
        q: question,
        a: answer,
        created_at: new Date().toISOString()
      }
      mockQAPairs.unshift(newQA)
      return newQA
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.QA_PAIRS)
        .insert([{ q: question, a: answer }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('添加问答失败:', error)
      throw error
    }
  },

  // 搜索答案
  async searchAnswer(question) {
    if (!isConfigured) {
      const lowerQuestion = question.toLowerCase()
      const match = mockQAPairs.find(qa => 
        qa.q.toLowerCase().includes(lowerQuestion) ||
        lowerQuestion.includes(qa.q.toLowerCase())
      )
      return match ? match.a : null
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.QA_PAIRS)
        .select('*')
      
      if (error) throw error
      
      // 简单的关键词匹配
      const lowerQuestion = question.toLowerCase()
      const match = data.find(qa => 
        qa.q.toLowerCase().includes(lowerQuestion) ||
        lowerQuestion.includes(qa.q.toLowerCase())
      )
      
      return match ? match.a : null
    } catch (error) {
      console.error('搜索失败:', error)
      return null
    }
  }
}
