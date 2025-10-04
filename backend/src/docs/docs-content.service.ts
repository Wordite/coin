import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentationDto, UpdateDocumentationDto, Documentation } from './docs-content.controller';
import { join, extname, dirname, basename } from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';
import * as crypto from 'crypto';

@Injectable()
export class DocsContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== Path helpers =====
  private getDocsRoot(): string {
    if (process.env.DOCKER) return '/app/docs-content/docs';
    // Try common locations relative to process cwd and compiled dir
    const candidates = [
      join(process.cwd(), 'docs/content/docs'),
      join(process.cwd(), '../docs/content/docs'),
      join(process.cwd(), '../../docs/content/docs'),
      join(__dirname, '../../../docs/content/docs'), // from dist/docs -> repo/docs
      join(__dirname, '../../../../docs/content/docs')
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) return p;
      } catch {}
    }
    // Fallback to project structure relative to backend dir
    return join(process.cwd(), '../docs/content/docs');
  }

  private async getCategorySlugById(categoryId?: string | null): Promise<string | null> {
    if (!categoryId) return null;
    const category = await this.prisma.documentation.findUnique({ where: { id: categoryId } });
    return category?.slug ?? null;
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let candidate = baseSlug;
    let counter = 1;
    // Try to find a unique slug; exclude current id if provided
    // Prevent infinite loop by limiting attempts
    while (true) {
      const existing = await this.prisma.documentation.findFirst({
        where: excludeId ? { slug: candidate, NOT: { id: excludeId } } : { slug: candidate }
      });
      if (!existing) return candidate;
      candidate = `${baseSlug}-${counter}`;
      counter++;
      if (counter > 1000) return `${baseSlug}-${Date.now()}`; // fallback
    }
  }

  private getDocBaseName(doc: any, categorySlug: string | null): string {
    return doc.slug;
  }

  private async computeTargetFilePath(doc: any): Promise<{ absolutePath: string; relativePath: string }>{
    const root = this.getDocsRoot();
    const categorySlug = await this.getCategorySlugById(doc.categoryId);
    const baseName = this.getDocBaseName(doc, categorySlug);
    const extension = doc.filePath ? extname(doc.filePath) || '.mdx' : '.mdx';
    const relativePath = categorySlug ? join(categorySlug, `${baseName}${extension}`) : `${baseName}${extension}`;
    const absolutePath = join(root, relativePath);
    return { absolutePath, relativePath };
  }

  private ensureDirExists(filePath: string): void {
    const dir = dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private async ensureCategoryFolder(categorySlug: string): Promise<void> {
    const root = this.getDocsRoot();
    const folder = join(root, categorySlug);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  private async removeCategoryFolder(categorySlug: string): Promise<void> {
    const root = this.getDocsRoot();
    const folder = join(root, categorySlug);
    if (fs.existsSync(folder)) {
      try {
        fs.rmSync(folder, { recursive: true, force: true });
      } catch (e) {
        console.error(`Failed to remove category folder ${folder}:`, e);
      }
    }
  }

  private async syncFileOnDocChange(previousDoc: any, currentDoc: any): Promise<void> {
    try {
      const root = this.getDocsRoot();

      // Determine old file path
      let oldAbsolute: string | null = null;
      if (previousDoc.filePath) {
        oldAbsolute = join(root, previousDoc.filePath);
      } else {
        const prevCategorySlug = await this.getCategorySlugById(previousDoc.categoryId);
        const prevBase = this.getDocBaseName(previousDoc, prevCategorySlug);
        const prevExt = previousDoc.filePath ? extname(previousDoc.filePath) : '.mdx';
        const prevRel = prevCategorySlug ? join(prevCategorySlug, `${prevBase}${prevExt}`) : `${prevBase}${prevExt}`;
        oldAbsolute = join(root, prevRel);
      }

      // Determine new file path
      const { absolutePath: newAbsolute, relativePath: newRelative } = await this.computeTargetFilePath(currentDoc);
      this.ensureDirExists(newAbsolute);

      const frontmatter = {
        title: currentDoc.title,
        slug: currentDoc.slug,
        description: currentDoc.description,
        published: currentDoc.isPublished,
        sidebar_position: currentDoc.order
      };
      const fileContent = matter.stringify(currentDoc.content ?? '', frontmatter);

      // Move if old exists and different; otherwise write
      if (oldAbsolute !== newAbsolute && fs.existsSync(oldAbsolute)) {
        try {
          this.ensureDirExists(newAbsolute);
          fs.renameSync(oldAbsolute, newAbsolute);
        } catch (e) {
          console.warn('Rename failed, writing new file instead:', e);
          fs.writeFileSync(newAbsolute, fileContent, 'utf-8');
          if (fs.existsSync(oldAbsolute)) {
            try { fs.unlinkSync(oldAbsolute); } catch {}
          }
        }
      } else {
        fs.writeFileSync(newAbsolute, fileContent, 'utf-8');
      }

      const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');
      await this.prisma.documentation.update({
        where: { id: currentDoc.id },
        data: { filePath: newRelative, fileHash, lastSyncedAt: new Date() }
      });
    } catch (error) {
      console.error('Error syncing file on doc change:', error);
    }
  }

  private async syncCategoryOnUpdate(previousCategory: any, currentCategory: any): Promise<void> {
    const root = this.getDocsRoot();
    if (previousCategory.slug === currentCategory.slug) return;
    const oldFolder = join(root, previousCategory.slug);
    const newFolder = join(root, currentCategory.slug);
    try {
      if (fs.existsSync(oldFolder)) {
        // Ensure parent exists then rename folder
        this.ensureDirExists(join(newFolder, '..'));
        fs.renameSync(oldFolder, newFolder);
      } else {
        // If old folder didn't exist, just create the new one
        fs.mkdirSync(newFolder, { recursive: true });
      }

      // Update filePath for all documents in this category
      const children = await this.prisma.documentation.findMany({ where: { categoryId: currentCategory.id, type: 'DOCUMENT' } });
      for (const child of children) {
        const { relativePath, absolutePath } = await this.computeTargetFilePath(child);
        // If existing filePath points to old folder, move file
        if (child.filePath) {
          const childOldAbs = join(root, child.filePath);
          if (fs.existsSync(childOldAbs) && childOldAbs !== absolutePath) {
            this.ensureDirExists(absolutePath);
            try { fs.renameSync(childOldAbs, absolutePath); } catch {}
          }
        }
        await this.prisma.documentation.update({ where: { id: child.id }, data: { filePath: relativePath } });
      }
    } catch (error) {
      console.error('Error syncing category folder rename:', error);
    }
  }

  // ===== Filesystem structure scan =====
  async getFilesystemStructure(): Promise<Record<string, Array<{ title: string; slug: string; file: string; relativePath: string }>>> {
    const docsRoot = this.getDocsRoot();
    const result: Record<string, Array<{ title: string; slug: string; file: string; relativePath: string }>> = { root: [] };

    const isDocFile = (name: string) => name.endsWith('.mdx');

    try {
      const entries = fs.readdirSync(docsRoot, { withFileTypes: true });
      for (const entry of entries) {
        const abs = join(docsRoot, entry.name);
        if (entry.isDirectory()) {
          const categoryFolder = entry.name;
          const categorySlug = this.generateSlug(categoryFolder);
          if (!result[categorySlug]) result[categorySlug] = [];
          const inner = fs.readdirSync(abs, { withFileTypes: true });
          for (const fileEntry of inner) {
            if (!fileEntry.isFile() || !isDocFile(fileEntry.name)) continue;
            const fileAbs = join(abs, fileEntry.name);
            try {
              const content = fs.readFileSync(fileAbs, 'utf-8');
              const parsed = matter(content);
              const title = parsed.data.title || this.getTitleFromFilename(fileEntry.name);
              const baseSlug = parsed.data.slug || this.generateSlug(title);
              const relativePath = join(categoryFolder, fileEntry.name);
              result[categorySlug].push({ title, slug: baseSlug, file: fileEntry.name, relativePath });
            } catch (e) {
              console.error('Failed to read doc file:', fileAbs, e);
            }
          }
        } else if (entry.isFile() && isDocFile(entry.name)) {
          // root-level docs
          try {
            const content = fs.readFileSync(abs, 'utf-8');
            const parsed = matter(content);
            const title = parsed.data.title || this.getTitleFromFilename(entry.name);
            const slug = parsed.data.slug || this.generateSlug(title);
            result.root.push({ title, slug, file: entry.name, relativePath: entry.name });
          } catch (e) {
            console.error('Failed to read root doc file:', abs, e);
          }
        }
      }
    } catch (error) {
      console.error('Error scanning filesystem structure:', error);
    }

    return result;
  }

  // ===== File-only CRUD API =====
  async readFsDocument(relativePath: string): Promise<{ frontmatter: any; content: string }> {
    const root = this.getDocsRoot();
    const filePath = join(root, relativePath);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(raw);
    return { frontmatter: parsed.data, content: parsed.content };
  }

  async createFsDocument(input: {
    categorySlug?: string | null;
    slug?: string;
    title?: string;
    description?: string;
    content?: string;
    published?: boolean;
    order?: number;
    extension?: '.mdx' | '.md';
  }): Promise<{ relativePath: string }> {
    const root = this.getDocsRoot();
    const categorySlug = input.categorySlug || null;
    const title = input.title || input.slug || 'Untitled';
    const baseSlug = input.slug || this.generateSlug(title);
    const extension = '.mdx';
    const relativePath = categorySlug ? join(categorySlug, `${baseSlug}${extension}`) : `${baseSlug}${extension}`;
    const absolutePath = join(root, relativePath);
    this.ensureDirExists(absolutePath);
    const fileContent = matter.stringify(input.content || '', {
      title,
      slug: baseSlug,
      description: input.description,
      published: input.published !== false,
      sidebar_position: input.order || 0
    });
    fs.writeFileSync(absolutePath, fileContent, 'utf-8');
    return { relativePath };
  }

  async updateFsDocument(input: {
    relativePath: string;
    newCategorySlug?: string | null;
    newSlug?: string;
    title?: string;
    description?: string;
    content?: string;
    published?: boolean;
    order?: number;
  }): Promise<{ relativePath: string }> {
    const root = this.getDocsRoot();
    const oldAbs = join(root, input.relativePath);
    const raw = fs.readFileSync(oldAbs, 'utf-8');
    const parsed = matter(raw);

    const currentFileName = basename(input.relativePath);
    const currentExt = '.mdx';

    // determine new location and name
    const folderSlug = input.newCategorySlug === undefined ? dirname(input.relativePath).split('/')[0] || null : input.newCategorySlug;
    const currentTitle = input.title ?? parsed.data.title;
    const baseSlug = input.newSlug || parsed.data.slug?.toString().split('-').pop() || this.generateSlug(currentTitle || 'untitled');
    const newFileName = `${baseSlug}${currentExt}`;
    const relativePath = folderSlug ? join(folderSlug, newFileName) : newFileName;
    const newAbs = join(root, relativePath);
    this.ensureDirExists(newAbs);

    const fm = {
      title: currentTitle,
      slug: baseSlug,
      description: input.description ?? parsed.data.description,
      published: input.published ?? (parsed.data.published !== false),
      sidebar_position: input.order ?? (parsed.data.sidebar_position || 0)
    };
    const fileContent = matter.stringify(input.content ?? parsed.content, fm);

    if (newAbs !== oldAbs) {
      try {
        this.ensureDirExists(newAbs);
        fs.renameSync(oldAbs, newAbs);
      } catch {
        // fallback to write new then remove old
        fs.writeFileSync(newAbs, fileContent, 'utf-8');
        try { fs.unlinkSync(oldAbs); } catch {}
      }
    }
    fs.writeFileSync(newAbs, fileContent, 'utf-8');
    return { relativePath };
  }

  async deleteFsDocument(relativePath: string): Promise<void> {
    const root = this.getDocsRoot();
    const abs = join(root, relativePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }

  async createFsCategory(slug: string): Promise<void> {
    await this.ensureCategoryFolder(slug);
  }

  async updateFsCategory(oldSlug: string, newSlug: string): Promise<void> {
    await this.syncCategoryOnUpdate({ slug: oldSlug, id: 'tmp' }, { slug: newSlug, id: 'tmp' });
  }

  async deleteFsCategory(slug: string): Promise<void> {
    await this.removeCategoryFolder(slug);
  }

  async getAll(): Promise<Documentation[]> {
    const docs = await this.prisma.documentation.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return docs.map(doc => this.mapToDocumentation(doc));
  }

  async getPublished(): Promise<Documentation[]> {
    const docs = await this.prisma.documentation.findMany({
      where: { isPublished: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return docs.map(doc => this.mapToDocumentation(doc));
  }

  async getCategories(): Promise<Documentation[]> {
    const docs = await this.prisma.documentation.findMany({
      where: { type: 'CATEGORY' },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return docs.map(doc => this.mapToDocumentation(doc));
  }

  async getDocumentsByCategory(categoryId: string): Promise<Documentation[]> {
    const docs = await this.prisma.documentation.findMany({
      where: { 
        type: 'DOCUMENT',
        categoryId: categoryId
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return docs.map(doc => this.mapToDocumentation(doc));
  }

  async getById(id: string): Promise<Documentation> {
    const doc = await this.prisma.documentation.findUnique({
      where: { id }
    });

    if (!doc) {
      throw new NotFoundException(`Documentation with ID ${id} not found`);
    }

    return this.mapToDocumentation(doc);
  }

  async getBySlug(slug: string): Promise<Documentation> {
    const doc = await this.prisma.documentation.findFirst({
      where: { 
        slug,
        isPublished: true
      }
    });

    if (!doc) {
      throw new NotFoundException(`Documentation with slug ${slug} not found`);
    }

    return this.mapToDocumentation(doc);
  }

  async create(data: CreateDocumentationDto): Promise<Documentation> {
    // Generate slug if not provided
    let slug = data.slug || this.generateSlug(data.title || 'untitled');
    
    // Ensure slug is unique
    let counter = 1;
    let originalSlug = slug;
    while (await this.prisma.documentation.findUnique({ where: { slug } })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    // Get the next order number
    const maxOrder = await this.prisma.documentation.aggregate({
      _max: { order: true }
    });
    const order = (maxOrder._max.order || 0) + 1;

    const doc = await this.prisma.documentation.create({
      data: {
        title: data.title || 'Untitled',
        slug,
        content: data.content || '',
        description: data.description,
        isPublished: data.isPublished,
        order: data.order || order,
        type: data.type,
        categoryId: data.categoryId,
        isFileBased: false // Создан через UI
      }
    });

    // Если это документ (не категория), создаем файл
    if (data.type === 'DOCUMENT') {
      await this.createFileFromDocument(doc);
    }
    // Если это категория, создаем папку
    if (data.type === 'CATEGORY') {
      await this.ensureCategoryFolder(doc.slug);
    }

    return this.mapToDocumentation(doc);
  }

  async update(id: string, data: UpdateDocumentationDto): Promise<Documentation> {
    const existingDoc = await this.prisma.documentation.findUnique({
      where: { id }
    });

    if (!existingDoc) {
      throw new NotFoundException(`Documentation with ID ${id} not found`);
    }

    // Compute slug changes: title change or category change
    let slug = data.slug ?? existingDoc.slug;
    const titleChanged = !!(data.title && data.title !== existingDoc.title);
    const categoryChanged = typeof data.categoryId !== 'undefined' && data.categoryId !== existingDoc.categoryId;
    if (titleChanged && !data.slug) {
      // regenerate base from new title
      slug = this.generateSlug(data.title as string);
    }
    if (categoryChanged) {
      const prevCategorySlug = await this.getCategorySlugById(existingDoc.categoryId);
      const newCategorySlug = await this.getCategorySlugById(data.categoryId ?? null);
      // strip old prefix from current slug to base
      let basePart = slug;
      if (prevCategorySlug && slug.startsWith(`${prevCategorySlug}-`)) {
        basePart = slug.slice(prevCategorySlug.length + 1);
      }
      slug = newCategorySlug ? `${newCategorySlug}-${basePart}` : basePart;
    }
    // Ensure uniqueness
    slug = await this.ensureUniqueSlug(slug, id);

    const doc = await this.prisma.documentation.update({
      where: { id },
      data: {
        ...data,
        slug: slug || existingDoc.slug
      }
    });

    // Синхронизируем изменения на файловой системе
    if (doc.type === 'DOCUMENT') {
      await this.syncFileOnDocChange(existingDoc as any, doc as any);
    }
    if (doc.type === 'CATEGORY') {
      await this.syncCategoryOnUpdate(existingDoc as any, doc as any);
    }

    return this.mapToDocumentation(doc);
  }

  async delete(id: string): Promise<void> {
    const doc = await this.prisma.documentation.findUnique({
      where: { id }
    });

    if (!doc) {
      throw new NotFoundException(`Documentation with ID ${id} not found`);
    }

    // Если это документ и он не основан на файле, удаляем файл
    if (doc.type === 'DOCUMENT' && !doc.isFileBased && doc.filePath) {
      await this.deleteFileFromDocument(doc);
    }

    // If it's a category, also delete all documents in it and remove folder
    if (doc.type === 'CATEGORY') {
      await this.prisma.documentation.deleteMany({
        where: { categoryId: id }
      });
      await this.removeCategoryFolder(doc.slug);
    }

    await this.prisma.documentation.delete({
      where: { id }
    });
  }

  async reorder(items: Array<{ id: string; order: number; categoryId?: string }>): Promise<void> {
    for (const item of items) {
      const previous = await this.prisma.documentation.findUnique({ where: { id: item.id } });
      // If only order/category is set here, compute slug change if category changed
      let newSlug: string | undefined = undefined;
      if (previous && previous.type === 'DOCUMENT' && typeof item.categoryId !== 'undefined' && item.categoryId !== previous.categoryId) {
        const prevCatSlug = await this.getCategorySlugById(previous.categoryId);
        const newCatSlug = await this.getCategorySlugById(item.categoryId ?? null);
        let basePart = previous.slug;
        if (prevCatSlug && previous.slug.startsWith(`${prevCatSlug}-`)) {
          basePart = previous.slug.slice(prevCatSlug.length + 1);
        }
        newSlug = newCatSlug ? `${newCatSlug}-${basePart}` : basePart;
        newSlug = await this.ensureUniqueSlug(newSlug, previous.id);
      }
      const updated = await this.prisma.documentation.update({
        where: { id: item.id },
        data: {
          order: item.order,
          categoryId: item.categoryId,
          ...(newSlug ? { slug: newSlug } : {})
        }
      });
      // Если документ сменил категорию, переместим файл
      if (updated.type === 'DOCUMENT' && (previous?.categoryId !== updated.categoryId)) {
        await this.syncFileOnDocChange(previous as any, updated as any);
      }
    }
  }

  async syncWithFileSystem(): Promise<{ message: string; synced: number; updated: number }> {
    const docsRoot = this.getDocsRoot();
    let syncedCount = 0;
    let updatedCount = 0;

    try {
      const structure = await this.getFilesystemStructure();

      // 1) Ensure categories exist based on folder names
      const categorySlugToId: Record<string, string> = {};
      for (const key of Object.keys(structure)) {
        if (key === 'root') continue;
        const slug = key; // already normalized by getFilesystemStructure
        const title = this.formatCategoryTitle(slug);
        let category = await this.prisma.documentation.findFirst({ where: { slug, type: 'CATEGORY' } });
        if (!category) {
          category = await this.prisma.documentation.create({
            data: {
              title,
              slug,
              content: `Category: ${title}`,
              description: `Documents in ${title} category`,
              isPublished: true,
              order: 0,
              type: 'CATEGORY',
              isFileBased: true
            }
          });
          syncedCount++;
        }
        categorySlugToId[slug] = category.id;
      }

      const upsertDocFromFile = async (
        entry: { title: string; slug: string; file: string; relativePath: string },
        categorySlug: string | null
      ) => {
        const abs = join(docsRoot, entry.relativePath);
        const raw = fs.readFileSync(abs, 'utf-8');
        const parsed = matter(raw);
        const fileHash = crypto.createHash('md5').update(raw).digest('hex');
        const title = parsed.data.title || entry.title || this.getTitleFromFilename(entry.file);
        const description = parsed.data.description || '';
        const isPublished = parsed.data.published !== false;
        const order = parsed.data.sidebar_position || 0;
        const slug = entry.slug; // already includes category prefix when applicable
        const categoryId = categorySlug ? categorySlugToId[categorySlug] ?? null : null;

        const existingDoc = await this.prisma.documentation.findFirst({ where: { slug } });
        if (!existingDoc) {
          await this.prisma.documentation.create({
            data: {
              title,
              slug,
              content: parsed.content,
              description,
              isPublished,
              order,
              type: 'DOCUMENT',
              categoryId,
              filePath: entry.relativePath,
              fileHash,
              lastSyncedAt: new Date(),
              isFileBased: true
            }
          });
          syncedCount++;
        } else if (existingDoc.isFileBased && existingDoc.fileHash !== fileHash) {
          await this.prisma.documentation.update({
            where: { id: existingDoc.id },
            data: {
              title,
              content: parsed.content,
              description,
              isPublished,
              order,
              categoryId,
              fileHash,
              lastSyncedAt: new Date()
            }
          });
          updatedCount++;
        }
      };

      // 2) Upsert root docs
      for (const doc of structure.root || []) {
        await upsertDocFromFile(doc, null);
      }
      // 3) Upsert category docs
      for (const [categorySlug, docs] of Object.entries(structure)) {
        if (categorySlug === 'root') continue;
        for (const doc of docs) {
          await upsertDocFromFile(doc, categorySlug);
        }
      }

      return {
        message: `Successfully synced ${syncedCount} new items and updated ${updatedCount} existing items from file system`,
        synced: syncedCount,
        updated: updatedCount
      };
    } catch (error) {
      console.error('Error syncing with file system:', error);
      throw new Error('Failed to sync with file system');
    }
  }

  // Двунаправленная синхронизация: файлы -> БД и БД -> файлы
  async syncBidirectional(): Promise<{ 
    message: string; 
    filesToDb: { synced: number; updated: number };
    dbToFiles: { created: number; updated: number };
  }> {
    // 1. Синхронизация файлов в БД
    const filesToDb = await this.syncWithFileSystem();
    
    // 2. Синхронизация БД в файлы (для документов, созданных через UI)
    const dbToFiles = await this.syncDbToFiles();
    
    return {
      message: `Bidirectional sync completed. Files to DB: ${filesToDb.synced} new, ${filesToDb.updated} updated. DB to Files: ${dbToFiles.created} created, ${dbToFiles.updated} updated.`,
      filesToDb: { synced: filesToDb.synced, updated: filesToDb.updated },
      dbToFiles
    };
  }

  private async syncDbToFiles(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    
    try {
      // Получаем все документы, созданные через UI (не основанные на файлах)
      const uiDocuments = await this.prisma.documentation.findMany({
        where: {
          type: 'DOCUMENT',
          isFileBased: false
        }
      });
      
      for (const doc of uiDocuments) {
        try {
          const docsPath = this.getDocsRoot();
          const fileName = `${doc.slug}.md`;
          const filePath = join(docsPath, fileName);
          
          // Проверяем, существует ли файл
          const fileExists = fs.existsSync(filePath);
          
          if (!fileExists) {
            // Создаем файл
            await this.createFileFromDocument(doc);
            created++;
          } else {
            // Обновляем существующий файл
            await this.updateFileFromDocument(doc);
            updated++;
          }
        } catch (error) {
          console.error(`Error syncing document ${doc.id} to file:`, error);
        }
      }
      
      return { created, updated };
    } catch (error) {
      console.error('Error syncing DB to files:', error);
      throw new Error('Failed to sync DB to files');
    }
  }

  private mapToDocumentation(doc: any): Documentation {
    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      content: doc.content,
      description: doc.description,
      isPublished: doc.isPublished,
      order: doc.order,
      type: doc.type,
      categoryId: doc.categoryId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private getTitleFromFilename(filename: string): string {
    const nameWithoutExt = filename.replace(/\.(md|mdx)$/, '');
    const lastPart = nameWithoutExt.split('/').pop();
    if (!lastPart) return filename;
    return lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private getAllFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Рекурсивно обрабатываем подпапки
          files.push(...this.getAllFiles(fullPath));
        } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
          // Игнорируем _category_.json файлы
          if (!item.includes('_category_')) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }
    
    return files;
  }

  // Методы для работы с Fumadocs
  private async createCategoriesFromFolders(docsPath: string): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    try {
      const items = fs.readdirSync(docsPath);
      
      for (const item of items) {
        const fullPath = join(docsPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Создаем категорию из папки
          const categoryTitle = this.formatCategoryTitle(item);
          const categorySlug = this.generateSlug(item);
          
          const existingCategory = await this.prisma.documentation.findFirst({
            where: { slug: categorySlug, type: 'CATEGORY' }
          });

          if (!existingCategory) {
            await this.prisma.documentation.create({
              data: {
                title: categoryTitle,
                slug: categorySlug,
                content: `Category: ${categoryTitle}`,
                description: `Documents in ${categoryTitle} category`,
                isPublished: true,
                order: 0,
                type: 'CATEGORY',
                isFileBased: true
              }
            });
            created++;
          }
        }
      }
    } catch (error) {
      console.error('Error creating categories from folders:', error);
    }

    return { created, updated };
  }

  private getCategoryFromPath(filePath: string): string | null {
    const parts = filePath.split('/');
    if (parts.length > 1) {
      // Файл находится в подпапке - возвращаем slug папки
      return this.generateSlug(parts[0]);
    }
    return null; // Файл в корневой папке
  }

  private formatCategoryTitle(folderName: string): string {
    return folderName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  // Методы для работы с файлами в гибридном подходе
  async createFileFromDocument(doc: any): Promise<void> {
    try {
      const { absolutePath, relativePath } = await this.computeTargetFilePath(doc);
      this.ensureDirExists(absolutePath);
      
      // Создаем директорию если не существует
      // (ensureDirExists already did)
      
      // Создаем frontmatter
      const frontmatter = {
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        published: doc.isPublished,
        sidebar_position: doc.order
      };
      
      const fileContent = matter.stringify(doc.content, frontmatter);
      
      // Записываем файл
      fs.writeFileSync(absolutePath, fileContent, 'utf-8');
      
      // Обновляем запись в БД с путем к файлу
      const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');
      await this.prisma.documentation.update({
        where: { id: doc.id },
        data: {
          filePath: relativePath,
          fileHash,
          lastSyncedAt: new Date()
        }
      });
    } catch (error) {
      console.error(`Error creating file for document ${doc.id}:`, error);
    }
  }

  async updateFileFromDocument(doc: any): Promise<void> {
    try {
      if (!doc.filePath) {
        await this.createFileFromDocument(doc);
        return;
      }
      
      const { absolutePath } = await this.computeTargetFilePath(doc);
      this.ensureDirExists(absolutePath);
      
      // Создаем frontmatter
      const frontmatter = {
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        published: doc.isPublished,
        sidebar_position: doc.order
      };
      
      const fileContent = matter.stringify(doc.content, frontmatter);
      
      // Записываем файл
      fs.writeFileSync(absolutePath, fileContent, 'utf-8');
      
      // Обновляем хеш файла
      const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');
      await this.prisma.documentation.update({
        where: { id: doc.id },
        data: {
          fileHash,
          lastSyncedAt: new Date()
        }
      });
    } catch (error) {
      console.error(`Error updating file for document ${doc.id}:`, error);
    }
  }

  async deleteFileFromDocument(doc: any): Promise<void> {
    try {
      if (!doc.filePath) return;
      
      const root = this.getDocsRoot();
      const filePath = join(root, doc.filePath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file for document ${doc.id}:`, error);
    }
  }
}
