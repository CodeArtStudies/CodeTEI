import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCodeWorkSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  sourceCode: z.string().min(1),
  language: z.string().optional(),
  sha3Hash: z.string(),
  codeteiXml: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCodeWorkSchema.parse(body)

    const codeWork = await prisma.codeWork.create({
      data: {
        title: validatedData.title,
        author: validatedData.author,
        sourceCode: validatedData.sourceCode,
        sha3Hash: validatedData.sha3Hash,
        codeteiXml: validatedData.codeteiXml,
      },
    })

    return NextResponse.json(codeWork, { status: 201 })
  } catch (error) {
    console.error('Error creating code work:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const codeWorks = await prisma.codeWork.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        explanations: true,
        executions: true,
        _count: {
          select: {
            explanations: true,
            executions: true,
          },
        },
      },
    })

    return NextResponse.json(codeWorks)
  } catch (error) {
    console.error('Error fetching code works:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}