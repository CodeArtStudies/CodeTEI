import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createExplanationSchema = z.object({
  type: z.enum(['work', 'line']),
  lineNumber: z.number().optional(),
  content: z.string().min(1),
  agent: z.string().default('chatgpt'),
  model: z.string().optional(),
  confidence: z.number().optional(),
  understanding: z.number().min(1).max(3).optional(),
  question: z.string().optional(),
  codeWorkId: z.string(),
})

const updateExplanationSchema = z.object({
  understanding: z.number().min(1).max(3).optional(),
  question: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createExplanationSchema.parse(body)

    const explanation = await prisma.explanation.create({
      data: validatedData,
    })

    return NextResponse.json(explanation, { status: 201 })
  } catch (error) {
    console.error('Error creating explanation:', error)
    
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const validatedData = updateExplanationSchema.parse(updateData)

    const explanation = await prisma.explanation.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(explanation)
  } catch (error) {
    console.error('Error updating explanation:', error)
    
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