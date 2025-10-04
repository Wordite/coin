import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Complex Section Type
  const complexSectionType = await prisma.sectionType.create({
    data: {
      name: 'Complex Benefits Section',
      description: 'Section with array of benefits containing title, description and icon',
      color: 'success',
      fields: {
        create: [
          {
            name: 'Benefits List',
            type: 'COMPLEX',
            description: 'Array of benefits with title, description and icon',
            required: true,
            multiple: true,
            withImage: false,
            maxSelection: 10,
            order: 0,
            validation: {
              enableFirstInput: true,
              enableSecondInput: false,
              enableImage: false,
              firstInputLabel: 'Title',
              secondInputLabel: 'Description',
              imageLabel: 'Icon',
            },
          },
        ],
      },
    },
  });

  // Create a section using this type
  const complexSection = await prisma.section.create({
    data: {
      name: 'Complex Benefits Section',
      link: 'complex-benefits',
      content: {
        'Benefits List': [
          {
            firstInput: 'Decentralized Finance',
            secondInput: 'Experience the future of finance with tools like staking, lending, and borrowing — all powered by blockchain, without traditional banks',
            image: 'https://example.com/icon1.png'
          },
          {
            firstInput: 'Smart Contracts',
            secondInput: 'Automated, trustless agreements that execute exactly as programmed without any possibility of downtime, censorship, fraud or third-party interference',
            image: 'https://example.com/icon2.png'
          },
          {
            firstInput: 'Global Access',
            secondInput: 'Access financial services from anywhere in the world, 24/7, without geographical restrictions or traditional banking hours',
            image: 'https://example.com/icon3.png'
          }
        ]
      },
      sectionTypeId: complexSectionType.id
    },
  });

  // Seeding completed
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 