import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const chore = await prisma.chore.findUnique({
      where: { id },
      include: {
        user: true,
        choreType: true,
      },
    });

    if (!chore) {
      return NextResponse.json(
        { error: '家务记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(chore);
  } catch (error) {
    console.error('获取家务记录失败:', error);
    return NextResponse.json(
      { error: '获取家务记录失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // 首先获取现有记录
    const existingChore = await prisma.chore.findUnique({
      where: { id },
    });

    if (!existingChore) {
      return NextResponse.json(
        { error: '家务记录不存在' },
        { status: 404 }
      );
    }

    // 获取请求数据
    const data = await request.json();
    console.log('接收到的数据:', data);

    // 准备更新数据，只更新提供的字段
    const updateData: {
      userId?: number;
      choreTypeId?: number;
      date?: Date;
      notes?: string | null;
      verified?: boolean;
    } = {};

    // 处理 userId
    if (data.userId !== undefined && data.userId !== null) {
      updateData.userId = parseInt(data.userId);
    }

    // 处理 choreTypeId
    if (data.choreTypeId !== undefined && data.choreTypeId !== null) {
      updateData.choreTypeId = parseInt(data.choreTypeId);
    }

    // 处理日期
    if (data.date !== undefined && data.date !== null) {
      try {
        let dateValue;
        if (typeof data.date === 'string') {
          // 如果是ISO日期字符串 (例如 2023-05-15T00:00:00.000Z)
          if (data.date.includes('T')) {
            dateValue = data.date.split('T')[0];
          } else {
            dateValue = data.date;
          }
        } else {
          dateValue = data.date;
        }

        const dateObj = new Date(dateValue);
        if (isNaN(dateObj.getTime())) {
          throw new Error(`无效的日期: ${data.date}`);
        }

        updateData.date = dateObj;
      } catch (e) {
        console.error('日期处理错误:', e);
        return NextResponse.json(
          { error: '无效的日期格式', details: String(e) },
          { status: 400 }
        );
      }
    }

    // 处理 notes
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    // 处理 verified - 只有当它是布尔值时才更新
    if (typeof data.verified === 'boolean') {
      updateData.verified = data.verified;
    }

    console.log('更新数据:', updateData);

    // 确保至少有一个字段要更新
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '没有提供任何有效的更新字段' },
        { status: 400 }
      );
    }

    // 执行更新
    const chore = await prisma.chore.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        choreType: true,
      },
    });

    return NextResponse.json(chore);
  } catch (error) {
    console.error('更新家务记录失败:', error);
    return NextResponse.json(
      { error: '更新家务记录失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.chore.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除家务记录失败:', error);
    return NextResponse.json(
      { error: '删除家务记录失败' },
      { status: 500 }
    );
  }
} 