import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up old field types...');

  try {
    // Находим все поля с удаляемыми типами (используем строковые литералы)
    const oldFields = await prisma.sectionField.findMany({
      where: {
        type: {
          in: ['SELECT', 'NUMBER', 'BOOLEAN', 'DATE'] as any
        }
      }
    });

    console.log(`Found ${oldFields.length} fields with old types`);

    if (oldFields.length > 0) {
      // Удаляем поля с старыми типами
      await prisma.sectionField.deleteMany({
        where: {
          type: {
            in: ['SELECT', 'NUMBER', 'BOOLEAN', 'DATE'] as any
          }
        }
      });

      console.log('Deleted old field types');
    }

    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 