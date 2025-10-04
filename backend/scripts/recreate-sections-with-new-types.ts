import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Recreating sections with new field types...');

  try {
    // Удаляем все существующие секции и поля
    await prisma.section.deleteMany();
    await prisma.sectionField.deleteMany();
    await prisma.sectionType.deleteMany();

    console.log('Cleaned up old data');

    // Создаем новые типы секций с упрощенными полями
    const sectionTypes = [
      {
        name: 'Hero Section',
        description: 'Main hero section with title, subtitle, and background image',
        color: 'primary',
        fields: [
          {
            name: 'Hero Title',
            type: 'CONTENT' as const,
            description: 'Main heading for the hero section',
            required: true,
            multiple: false,
            withImage: false,
            order: 0
          },
          {
            name: 'Hero Subtitle',
            type: 'CONTENT' as const,
            description: 'Subtitle text below the main heading',
            required: false,
            multiple: false,
            withImage: false,
            order: 1
          },
          {
            name: 'Background Image',
            type: 'IMAGES' as const,
            description: 'Background image for the hero section',
            required: true,
            multiple: false,
            order: 2
          }
        ]
      },
      {
        name: 'About Section',
        description: 'Company information and description',
        color: 'secondary',
        fields: [
          {
            name: 'About Title',
            type: 'CONTENT' as const,
            description: 'Section heading for company information',
            required: true,
            multiple: false,
            withImage: false,
            order: 0
          },
          {
            name: 'About Text',
            type: 'MARKDOWN' as const,
            description: 'Company description text with markdown support',
            required: true,
            multiple: false,
            order: 1
          },
          {
            name: 'Company Logo',
            type: 'IMAGES' as const,
            description: 'Company logo image',
            required: false,
            multiple: false,
            order: 2
          }
        ]
      },
      {
        name: 'Features Section',
        description: 'Product features and benefits',
        color: 'success',
        fields: [
          {
            name: 'Features Title',
            type: 'CONTENT' as const,
            description: 'Section heading for features',
            required: true,
            multiple: false,
            withImage: false,
            order: 0
          },
          {
            name: 'Feature Items',
            type: 'CONTENT' as const,
            description: 'Individual feature descriptions',
            required: true,
            multiple: true,
            withImage: true,
            maxSelection: 6,
            order: 1
          }
        ]
      }
    ];

    // Создаем типы секций и их поля
    for (const typeData of sectionTypes) {
      const { fields, ...typeInfo } = typeData;
      
      const sectionType = await prisma.sectionType.create({
        data: typeInfo
      });

      console.log(`Created section type: ${sectionType.name}`);

      // Создаем поля для этого типа
      for (const fieldData of fields) {
        await prisma.sectionField.create({
          data: {
            ...fieldData,
            sectionTypeId: sectionType.id
          }
        });
      }

      console.log(`Created ${fields.length} fields for ${sectionType.name}`);

      // Создаем пустую секцию для этого типа
      const section = await prisma.section.create({
        data: {
          name: sectionType.name,
          link: sectionType.name.toLowerCase().replace(/\s+/g, '-'),
          content: {},
          sectionTypeId: sectionType.id
        }
      });

      console.log(`Created section: ${section.name}`);
    }

    console.log('\nRecreation completed successfully!');
    
    // Показываем итоговую статистику
    const totalTypes = await prisma.sectionType.count();
    const totalFields = await prisma.sectionField.count();
    const totalSections = await prisma.section.count();
    
    console.log('\nFinal statistics:');
    console.log(`Total section types: ${totalTypes}`);
    console.log(`Total fields: ${totalFields}`);
    console.log(`Total sections: ${totalSections}`);

  } catch (error) {
    console.error('Error during recreation:', error);
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