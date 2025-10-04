import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting contact seed...')

  // Очищаем существующие контакты
  await prisma.contact.deleteMany({})
  console.log('🗑️ Cleared existing contacts')

  // Создаем 15 тестовых контактов
  const contacts = [
    {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      message: 'Hi! I\'m interested in your presale project. Can you provide more details about the tokenomics?',
      fingerprint: 'fp_001_john_doe',
      isRead: false,
    },
    {
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      message: 'Hello! I would like to participate in the presale. What are the minimum investment requirements?',
      fingerprint: 'fp_002_jane_smith',
      isRead: true,
    },
    {
      name: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: null,
      message: 'Great project! I\'ve been following your development. When will the presale start?',
      fingerprint: 'fp_003_mike_johnson',
      isRead: false,
    },
    {
      name: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1555123456',
      message: 'I\'m a crypto investor and I\'m very interested in your token. Can you share the whitepaper?',
      fingerprint: 'fp_004_sarah_wilson',
      isRead: true,
    },
    {
      name: 'David',
      lastName: 'Brown',
      email: 'david.brown@example.com',
      phone: '+1444987654',
      message: 'Hello team! I have some questions about the smart contract security. Are there any audits planned?',
      fingerprint: 'fp_005_david_brown',
      isRead: false,
    },
    {
      name: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '+1333777888',
      message: 'Hi! I\'m new to crypto but your project looks promising. Can you explain how the presale works?',
      fingerprint: 'fp_006_emily_davis',
      isRead: true,
    },
    {
      name: 'Robert',
      lastName: 'Miller',
      email: 'robert.miller@example.com',
      phone: null,
      message: 'I\'m interested in becoming a validator. What are the requirements and rewards?',
      fingerprint: 'fp_007_robert_miller',
      isRead: false,
    },
    {
      name: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@example.com',
      phone: '+1222333444',
      message: 'Great initiative! I\'d like to know more about the team behind this project.',
      fingerprint: 'fp_008_lisa_garcia',
      isRead: true,
    },
    {
      name: 'James',
      lastName: 'Martinez',
      email: 'james.martinez@example.com',
      phone: '+1111222333',
      message: 'Hello! I\'m a developer and I\'m interested in contributing to your project. Are you looking for developers?',
      fingerprint: 'fp_009_james_martinez',
      isRead: false,
    },
    {
      name: 'Maria',
      lastName: 'Rodriguez',
      email: 'maria.rodriguez@example.com',
      phone: '+1999888777',
      message: 'I\'m a marketing specialist. Do you need help with community building and marketing?',
      fingerprint: 'fp_010_maria_rodriguez',
      isRead: true,
    },
    {
      name: 'William',
      lastName: 'Lee',
      email: 'william.lee@example.com',
      phone: '+1888777666',
      message: 'Hi! I\'m interested in the presale but I have concerns about the token distribution. Can you clarify?',
      fingerprint: 'fp_011_william_lee',
      isRead: false,
    },
    {
      name: 'Jennifer',
      lastName: 'Taylor',
      email: 'jennifer.taylor@example.com',
      phone: null,
      message: 'Hello team! I\'m a crypto enthusiast and I\'d like to know about your roadmap and future plans.',
      fingerprint: 'fp_012_jennifer_taylor',
      isRead: true,
    },
    {
      name: 'Christopher',
      lastName: 'Anderson',
      email: 'christopher.anderson@example.com',
      phone: '+1777666555',
      message: 'I\'m interested in investing a significant amount. Do you have any VIP or early bird benefits?',
      fingerprint: 'fp_013_christopher_anderson',
      isRead: false,
    },
    {
      name: 'Amanda',
      lastName: 'Thomas',
      email: 'amanda.thomas@example.com',
      phone: '+1666555444',
      message: 'Hi! I\'m a blockchain consultant. I\'d like to discuss potential partnerships with your project.',
      fingerprint: 'fp_014_amanda_thomas',
      isRead: true,
    },
    {
      name: 'Michael',
      lastName: 'Jackson',
      email: 'michael.jackson@example.com',
      phone: '+1555444333',
      message: 'Great project! I\'m a crypto influencer with 100k followers. Would you be interested in collaboration?',
      fingerprint: 'fp_015_michael_jackson',
      isRead: false,
    },
  ]

  // Создаем контакты с задержкой для разных дат создания
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i]
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - (contacts.length - i)) // Разные даты создания
    
    await prisma.contact.create({
      data: {
        ...contact,
        createdAt,
        updatedAt: createdAt,
      },
    })
  }

  console.log(`✅ Created ${contacts.length} test contacts`)
  console.log('🌱 Contact seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
