import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);

    const choreType = await prisma.choreType.findUnique({
      where: { id },
    });

    if (!choreType) {
      return NextResponse.json(
        { error: '家务类型不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(choreType);
  } catch (error) {
    console.error('获取家务类型失败:', error);
    return NextResponse.json(
      { error: '获取家务类型失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    const data = await request.json();

    const choreType = await prisma.choreType.update({
      where: { id },
      data: {
        name: data.name,
        icon: data.icon,
        weight: data.weight,
        description: data.description,
      },
    });

    return NextResponse.json(choreType);
  } catch (error) {
    console.error('更新家务类型失败:', error);
    return NextResponse.json(
      { error: '更新家务类型失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);

    // 删除关联的家务记录
    await prisma.chore.deleteMany({
      where: { choreTypeId: id },
    });

    // 删除家务类型
    await prisma.choreType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除家务类型失败:', error);
    return NextResponse.json(
      { error: '删除家务类型失败' },
      { status: 500 }
    );
  }
} 