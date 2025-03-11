# 使用Node.js 20作为基础镜像
FROM node:20-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装依赖阶段
FROM base AS deps
# 检查你的操作系统是否需要额外的构建工具
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# 构建阶段
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产阶段
FROM base AS runner
ENV NODE_ENV production

# 添加非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# 设置环境变量
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 数据库迁移
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"] 