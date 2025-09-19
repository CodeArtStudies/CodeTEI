const { PrismaClient } = require('@prisma/client')
const { SHA3 } = require('crypto-js')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 空のデータベースで開始（サンプルデータなし）
  console.log('✅ Database is ready for use')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
