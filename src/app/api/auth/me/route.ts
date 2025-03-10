import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 查找会话
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      },
    });

    // 会话不存在或已过期
    if (!session || new Date() > session.expiresAt) {
      // 清除无效的会话cookie
      const response = NextResponse.json(
        { error: '会话已过期，请重新登录' },
        { status: 401 }
      );

      response.cookies.set({
        name: 'session_id',
        value: '',
        expires: new Date(0),
        httpOnly: true,
        path: '/',
      });

      // 如果会话存在但已过期，从数据库中删除
      if (session) {
        await prisma.session.delete({
          where: { id: sessionId },
        });
      }

      return response;
    }

    // 返回用户信息
    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      avatar: session.user.avatar,
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
} 