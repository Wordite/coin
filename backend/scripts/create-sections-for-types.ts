import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating sections for existing section types...');

  // Получаем все типы секций
  const sectionTypes = await prisma.sectionType.findMany();
  console.log(`Found ${sectionTypes.length} section types`);

  for (const sectionType of sectionTypes) {
    // Проверяем, есть ли уже секция для этого типа
    const existingSection = await prisma.section.findFirst({
      where: { sectionTypeId: sectionType.id }
    });

    if (!existingSection) {
      console.log(`Creating section for type: ${sectionType.name}`);
      
      const section = await prisma.section.create({
        data: {
          name: sectionType.name,
          link: sectionType.name.toLowerCase().replace(/\s+/g, '-'),
          content: {},
          sectionTypeId: sectionType.id
        }
      });
      
      console.log(`Created section: ${section.name} (${section.id})`);
    } else {
      console.log(`Section already exists for type: ${sectionType.name}`);
    }
  }

  // Обновляем существующие типы секций, добавляя цвета
  console.log('\nUpdating section types with colors...');
  
  const updates = [
    { name: 'Hero Section', color: 'primary' },
    { name: 'About Section', color: 'secondary' },
    { name: 'Features Section', color: 'success' },
    { name: 'dawdawd', color: 'warning' },
  ];

  for (const update of updates) {
    try {
      await prisma.sectionType.updateMany({
        where: { name: update.name },
        data: { 
          color: update.color as any
        }
      });
      console.log(`Updated ${update.name} with color: ${update.color}`);
    } catch (err) {
      console.log(`Failed to update ${update.name}:`, err);
    }
  }

  // Показываем итоговую статистику
  const totalSections = await prisma.section.count();
  const totalTypes = await prisma.sectionType.count();
  
  console.log('\nFinal statistics:');
  console.log(`Total section types: ${totalTypes}`);
  console.log(`Total sections: ${totalSections}`);
  
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 