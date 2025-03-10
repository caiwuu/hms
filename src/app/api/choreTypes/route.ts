import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const choreTypes = await prisma.choreType.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(choreTypes);
  } catch (error) {
    console.error('获取家务类型列表失败:', error);
    return NextResponse.json(
      { error: '获取家务类型列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const choreType = await prisma.choreType.create({
      data: {
        name: data.name,
        description: data.description || null,
        weight: data.weight || 1.0,
        icon: data.icon || null,
      },
    });

    return NextResponse.json(choreType, { status: 201 });
  } catch (error) {
    console.error('创建家务类型失败:', error);
    return NextResponse.json(
      { error: '创建家务类型失败' },
      { status: 500 }
    );
  }
} 