import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (sessionId) {
      // 从数据库删除会话
      try {
        await prisma.session.delete({
          where: { id: sessionId },
        });
      } catch {
        // 忽略会话不存在的错误
        console.log('会话不存在或已过期');
      }

      // 清除cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'session_id',
        value: '',
        expires: new Date(0),
        httpOnly: true,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('退出登录失败:', error);
    return NextResponse.json(
      { error: '退出登录失败' },
      { status: 500 }
    );
  }
} 