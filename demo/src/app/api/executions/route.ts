import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createExecutionSchema = z.object({
  type: z.enum(['container', 'blockchain', 'local']),
  containerInfo: z.string().optional().nullable(),
  chainName: z.string().optional().nullable(),
  txId: z.string().optional().nullable(),
  status: z.enum(['success', 'failed', 'pending']),
  notes: z.string().optional().nullable(),
  executedAt: z.string().datetime().optional(),
  codeWorkId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createExecutionSchema.parse(body)

    const executionData = {
      ...validatedData,
      executedAt: validatedData.executedAt ? new Date(validatedData.executedAt) : new Date(),
    }

    const execution = await prisma.execution.create({
      data: executionData,
    })

    return NextResponse.json(execution, { status: 201 })
  } catch (error) {
    console.error('Error creating execution:', error)
    
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