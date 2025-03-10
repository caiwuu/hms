import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 设置日期范围
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
        },
      };
    } else if (endDate) {
      dateFilter = {
        date: {
          lte: new Date(endDate),
        },
      };
    }

    // 获取所有用户
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // 获取每个用户的家务记录和总分
    const userStats = await Promise.all(
      users.map(async (user) => {
        const chores = await prisma.chore.findMany({
          where: {
            userId: user.id,
            verified: true,
            ...dateFilter,
          },
          include: {
            choreType: true,
          },
        });

        const totalPoints = chores.reduce(
          (sum, chore) => sum + chore.choreType.weight,
          0
        );

        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          totalPoints,
          choreCount: chores.length,
        };
      })
    );

    // 获取最近的家务记录
    const recentChores = await prisma.chore.findMany({
      where: {
        verified: true,
      },
      include: {
        user: true,
        choreType: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    });

    // 获取每日统计数据
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const dailyChores = await prisma.chore.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: now,
        },
        verified: true,
      },
      include: {
        user: true,
      },
    });

    // 按日期和用户分组
    const dailyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return {
        date: new Date(date.setHours(0, 0, 0, 0)),
        dayName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
      };
    }).reverse();

    // 填充每日统计数据
    const weeklyData = dailyStats.map((day) => {
      const dayChores = dailyChores.filter(
        (chore) =>
          new Date(chore.date).setHours(0, 0, 0, 0) === day.date.getTime()
      );

      const userCounts: Record<string, number> = {};
      users.forEach((user) => {
        userCounts[user.name] = dayChores
          .filter((chore) => chore.userId === user.id)
          .length;
      });

      return {
        name: day.dayName,
        ...userCounts,
      };
    });

    return NextResponse.json({
      userStats,
      recentChores,
      weeklyData,
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
} 