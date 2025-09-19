import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params

    const codeWork = await prisma.codeWork.findUnique({
      where: { sha3Hash: hash },
      include: {
        explanations: {
          orderBy: { createdAt: 'asc' }
        },
        executions: {
          orderBy: { executedAt: 'desc' }
        },
      },
    })

    if (!codeWork) {
      return NextResponse.json(
        { error: 'Code work not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(codeWork)
  } catch (error) {
    console.error('Error fetching code work:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}