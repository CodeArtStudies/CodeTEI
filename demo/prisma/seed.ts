const { PrismaClient } = require('@prisma/client')
const { SHA3 } = require('crypto-js')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 既存のデータをすべて削除
  console.log('🗑️ Clearing all existing data...')
  
  await prisma.execution.deleteMany({})
  console.log('✅ Deleted all executions')
  
  await prisma.explanation.deleteMany({})
  console.log('✅ Deleted all explanations')
  
  await prisma.codeWork.deleteMany({})
  console.log('✅ Deleted all code works')

  console.log('🎉 Database completely cleared!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
