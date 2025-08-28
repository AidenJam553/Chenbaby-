// 数据库连接检查脚本
// 运行方式：node check-connection.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

console.log('🔍 检查Supabase连接配置...\n')

// 检查环境变量
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('📋 环境变量检查:')
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`)
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ 环境变量未正确设置')
  console.log('请检查 .env 文件是否存在并包含正确的Supabase配置')
  process.exit(1)
}

// 检查URL格式
if (!supabaseUrl.includes('supabase.co')) {
  console.log('\n⚠️  URL格式可能不正确')
  console.log('确保URL格式为: https://your-project-id.supabase.co')
}

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('\n🔗 尝试连接到Supabase...')

async function testConnection() {
  try {
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ 连接失败:', error.message)
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n💡 解决方案:')
        console.log('1. 在Supabase SQL Editor中运行: \\i supabase_setup.sql')
        console.log('2. 然后运行: \\i storage_policies.sql')
      }
      
      return false
    }
    
    console.log('✅ 数据库连接成功!')
    
    // 测试表是否存在
    const tables = ['users', 'messages', 'photos', 'questions', 'game_records']
    console.log('\n📊 检查数据库表:')
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: 不存在或无权限访问`)
        } else {
          console.log(`✅ ${table}: 正常`)
        }
      } catch (err) {
        console.log(`❌ ${table}: 检查失败`)
      }
    }
    
    return true
    
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 恭喜！数据库配置正确，可以正常使用了！')
  } else {
    console.log('\n🛠️  请参考 DATABASE_CONNECTION_GUIDE.md 进行配置')
  }
})
