This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# 家务管理系统 (HMS)

## 项目介绍

这是一个基于 Next.js 开发的现代化家务管理系统，旨在帮助家庭成员更好地组织和管理日常家务工作。

### 主要功能

- 👥 **用户管理**：支持多用户注册和登录，可设置个人头像
- 📝 **家务类型管理**：可自定义不同类型的家务及其权重
- ✅ **家务记录**：记录每日完成的家务，支持添加备注
- 📊 **数据统计**：直观展示家务分配和完成情况
- 🔍 **记录验证**：支持家务完成情况的验证机制
- ⚙️ **系统设置**：灵活的系统参数配置

### 技术栈

- **前端框架**：Next.js 14
- **UI 框架**：Tailwind CSS
- **数据库**：MySQL 8.0
- **ORM**：Prisma
- **认证**：NextAuth.js
- **状态管理**：React Query

## 服务器部署步骤

### 1. 环境要求
- Node.js 18+ 
- MySQL 8.0+
- npm 或 yarn

### 2. 安装步骤

1. 克隆项目
```bash
git clone [你的项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，设置以下必要参数：
# DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
```

4. 初始化数据库
```bash
# 生成并应用数据库迁移
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate
```

5. 构建项目
```bash
npm run build
# 或
yarn build
```

6. 启动服务
```bash
# 使用 pm2 启动（推荐）
npm install -g pm2
pm2 start npm --name "hms" -- start

# 或直接启动
npm start
```

### 3. 更新步骤

当需要更新到最新版本时：

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖
npm install

# 3. 应用数据库迁移
npx prisma migrate deploy

# 4. 重新构建
npm run build

# 5. 重启服务
pm2 restart hms
```

### 4. 注意事项

- 确保数据库配置正确且有适当的访问权限
- 生产环境建议使用 PM2 等进程管理工具
- 建议配置 Nginx 反向代理
- 定期备份数据库
