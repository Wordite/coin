import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

// Generate random Solana wallet address
function generateSolanaAddress(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate random transaction
function generateTransaction(type: 'SOL' | 'USDT') {
  const amount = Math.random() * 10 + 0.1 // 0.1 to 10.1
  const rate = type === 'SOL' ? 0.0001 : 0.001 // Different rates for SOL and USDT
  const coinsPurchased = amount * rate
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    amount: Math.round(amount * 1000000) / 1000000, // 6 decimal places
    rate,
    coinsPurchased: Math.round(coinsPurchased * 1000000) / 1000000,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
    txHash: `tx_${Math.random().toString(36).substr(2, 16)}`,
    isReceived: Math.random() > 0.2, // 80% chance of being received
    isSuccessful: Math.random() > 0.1, // 90% chance of being successful
  }
}

// Generate random transactions for a user
function generateUserTransactions() {
  const transactionCount = Math.floor(Math.random() * 5) + 1 // 1 to 5 transactions
  const transactions: any[] = []
  
  for (let i = 0; i < transactionCount; i++) {
    const type = Math.random() > 0.5 ? 'SOL' : 'USDT'
    transactions.push(generateTransaction(type))
  }
  
  return transactions
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing users (except admins)
  await prisma.user.deleteMany({
    where: {
              role: Role.USER
    }
  })

  console.log('🗑️ Cleared existing users')

  // Create 100 test users
  const users: any[] = []
  
  for (let i = 1; i <= 100; i++) {
    const hasEmail = Math.random() < 0.1 // Only 10% of users have email
    
    const userData = {
      email: hasEmail ? `user${i}@example.com` : null,
      walletAddress: generateSolanaAddress(),
        role: Role.USER,
      transactions: generateUserTransactions(),
    }
    
    users.push(userData)
  }

  // Batch insert users
  for (const userData of users) {
    await prisma.user.create({
      data: userData
    })
  }

  console.log(`✅ Created ${users.length} test users`)
  
  // Show some statistics
  const totalUsers = await prisma.user.count()
  const usersWithEmail = await prisma.user.count({
    where: { email: { not: null } }
  })
  const usersWithWallet = await prisma.user.count({
    where: { walletAddress: { not: null } }
  })

  console.log('📊 Statistics:')
  console.log(`   Total users: ${totalUsers}`)
  console.log(`   Users with email: ${usersWithEmail}`)
  console.log(`   Users with wallet: ${usersWithWallet}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Disconnected from database')
  })