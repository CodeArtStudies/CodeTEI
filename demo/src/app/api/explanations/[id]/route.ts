import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if explanation exists
    const explanation = await prisma.explanation.findUnique({
      where: { id },
    })

    if (!explanation) {
      return NextResponse.json(
        { error: 'Explanation not found' },
        { status: 404 }
      )
    }

    // Delete the explanation
    await prisma.explanation.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Explanation deleted successfully' })
  } catch (error) {
    console.error('Error deleting explanation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
