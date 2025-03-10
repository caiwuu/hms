import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// 简单的密码散列函数
function hashPassword (password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main () {
  console.log('开始数据库种子填充...')

  // 清空现有数据
  await prisma.chore.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.choreType.deleteMany({})
  await prisma.setting.deleteMany({})

  // 创建用户
  const dad = await prisma.user.create({
    data: {
      name: '爸爸',
      username: 'dad',
      password: hashPassword('password123'),
      avatar: '/avatars/default.png',
    },
  })
  console.log(`创建用户: ${dad.name}`)

  const mom = await prisma.user.create({
    data: {
      name: '妈妈',
      username: 'mom',
      password: hashPassword('password123'),
      avatar: '/avatars/default.png',
    },
  })
  console.log(`创建用户: ${mom.name}`)

  const son = await prisma.user.create({
    data: {
      name: '儿子',
      username: 'son',
      password: hashPassword('password123'),
      avatar: '/avatars/default.png',
    },
  })
  console.log(`创建用户: ${son.name}`)

  const daughter = await prisma.user.create({
    data: {
      name: '女儿',
      username: 'daughter',
      password: hashPassword('password123'),
      avatar: '/avatars/default.png',
    },
  })
  console.log(`创建用户: ${daughter.name}`)

  // 创建家务类型
  const dishWashing = await prisma.choreType.create({
    data: {
      name: '洗碗',
      description: '清洗餐具和厨房用具',
      weight: 1.0,
      icon: '🍽️',
    },
  })

  const cleaning = await prisma.choreType.create({
    data: {
      name: '打扫',
      description: '清扫和整理房间',
      weight: 1.5,
      icon: '🧹',
    },
  })

  const cooking = await prisma.choreType.create({
    data: {
      name: '做饭',
      description: '准备一日三餐',
      weight: 2.0,
      icon: '🍳',
    },
  })

  const laundry = await prisma.choreType.create({
    data: {
      name: '洗衣',
      description: '洗涤和整理衣物',
      weight: 1.0,
      icon: '👕',
    },
  })

  const shopping = await prisma.choreType.create({
    data: {
      name: '买菜',
      description: '采购食材和日用品',
      weight: 1.2,
      icon: '🛒',
    },
  })

  // 创建一些家务记录
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  await prisma.chore.createMany({
    data: [
      {
        choreTypeId: cooking.id,
        userId: mom.id,
        date: today,
        notes: '准备了一家人的晚餐',
        verified: true,
      },
      {
        choreTypeId: dishWashing.id,
        userId: dad.id,
        date: today,
        notes: '晚餐后清洗了所有餐具',
        verified: true,
      },
      {
        choreTypeId: cleaning.id,
        userId: son.id,
        date: yesterday,
        notes: '打扫了客厅和自己的房间',
        verified: true,
      },
      {
        choreTypeId: laundry.id,
        userId: daughter.id,
        date: yesterday,
        notes: '洗了全家的衣服',
        verified: true,
      },
      {
        choreTypeId: shopping.id,
        userId: dad.id,
        date: twoDaysAgo,
        notes: '购买了周末所需的食材',
        verified: true,
      },
    ],
  })

  // 设置系统设置
  await prisma.setting.create({
    data: {
      key: 'system_name',
      value: '家务管理系统',
    },
  })

  // 创建默认用户
  const defaultUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: '管理员',
      username: 'admin',
      password: hashPassword('admin123'),
      avatar: null,
    },
  })
  console.log(`创建默认用户: ${defaultUser.name}`)

  console.log('数据库种子已成功植入！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 