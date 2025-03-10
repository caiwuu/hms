import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const choreTypeId = searchParams.get('choreTypeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const verified = searchParams.get('verified');

    // 构建查询条件
    const where: Prisma.ChoreWhereInput = {};

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (choreTypeId) {
      where.choreTypeId = parseInt(choreTypeId);
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      };
    }

    if (verified !== null && verified !== undefined) {
      where.verified = verified === 'true';
    }

    const chores = await prisma.chore.findMany({
      where,
      include: {
        user: true,
        choreType: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(chores);
  } catch (error) {
    console.error('获取家务记录失败:', error);
    return NextResponse.json(
      { error: '获取家务记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const chore = await prisma.chore.create({
      data: {
        userId: data.userId,
        choreTypeId: data.choreTypeId,
        date: new Date(data.date),
        notes: data.notes || null,
        verified: data.verified || false,
      },
      include: {
        user: true,
        choreType: true,
      },
    });

    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    console.error('创建家务记录失败:', error);
    return NextResponse.json(
      { error: '创建家务记录失败' },
      { status: 500 }
    );
  }
} 