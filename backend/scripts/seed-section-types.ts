import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding section types...');

  // Create Hero Section Type
  const heroSectionType = await prisma.sectionType.create({
    data: {
      name: 'Hero Section',
      description: 'Main hero section with title, subtitle, and background image',
      fields: {
        create: [
          {
            name: 'Hero Title',
            type: 'CONTENT',
            description: 'Main heading for the hero section',
            required: true,
            multiple: false,
            order: 0,
          },
          {
            name: 'Hero Subtitle',
            type: 'CONTENT',
            description: 'Supporting text below the main title',
            required: false,
            multiple: false,
            order: 1,
          },
          {
            name: 'Hero Background',
            type: 'IMAGES',
            description: 'Background image for hero section (recommended size: 1920x1080px)',
            required: false,
            multiple: false,
            maxSelection: 1,
            order: 2,
          },
          {
            name: 'Call to Action Text',
            type: 'CONTENT',
            description: 'Button text for call to action',
            required: false,
            multiple: false,
            order: 3,
          },
        ],
      },
    },
  });

  console.log('Created Hero Section Type:', heroSectionType.id);

  // Create About Section Type
  const aboutSectionType = await prisma.sectionType.create({
    data: {
      name: 'About Section',
      description: 'About section with company information and images',
      fields: {
        create: [
          {
            name: 'About Title',
            type: 'CONTENT',
            description: 'Section heading for company information',
            required: true,
            multiple: false,
            order: 0,
          },
          {
            name: 'About Text',
            type: 'MARKDOWN',
            description: 'Company description text with markdown support',
            required: true,
            multiple: false,
            order: 1,
          },
          {
            name: 'Company Logo',
            type: 'IMAGES',
            description: 'Main company logo (recommended size: 200x80px)',
            required: false,
            multiple: false,
            maxSelection: 1,
            order: 2,
          },
          {
            name: 'Gallery Images',
            type: 'IMAGES',
            description: 'Images for the gallery section (recommended size: 800x600px)',
            required: false,
            multiple: true,
            maxSelection: 10,
            order: 3,
          },
        ],
      },
    },
  });

  console.log('Created About Section Type:', aboutSectionType.id);

  // Create Features Section Type
  const featuresSectionType = await prisma.sectionType.create({
    data: {
      name: 'Features Section',
      description: 'Features section with multiple feature items',
      fields: {
        create: [
          {
            name: 'Section Title',
            type: 'CONTENT',
            description: 'Main title for features section',
            required: true,
            multiple: false,
            order: 0,
          },
          {
            name: 'Section Description',
            type: 'CONTENT',
            description: 'Brief description of the features section',
            required: false,
            multiple: false,
            order: 1,
          },
          {
            name: 'Feature Items',
            type: 'CONTENT',
            description: 'List of feature items (one per line)',
            required: true,
            multiple: true,
            order: 2,
          },
          {
            name: 'Feature Icons',
            type: 'IMAGES',
            description: 'Icons for each feature (recommended size: 64x64px)',
            required: false,
            multiple: true,
            maxSelection: 10,
            order: 3,
          },
        ],
      },
    },
  });

  console.log('Created Features Section Type:', featuresSectionType.id);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 