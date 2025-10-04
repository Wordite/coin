import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { exec } from 'child_process'
import { promisify } from 'util'
import matter from 'gray-matter'
import { deleteAsync } from 'del'
import { globby } from 'globby'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, renameSync } from 'fs'
import { join } from 'path'

@Injectable()
export class DocsService {
  private readonly logger = new Logger(DocsService.name)
  private readonly execAsync = promisify(exec)

  constructor(private readonly prisma: PrismaService) {}

  getDocsPath(): string {
    return '/app/docs-content/docs'
  }

  /**
   * Читает MDX файл с парсингом frontmatter
   */
  readFile(filePath: string) {
    const fullPath = join(this.getDocsPath(), filePath)
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    
    const content = readFileSync(fullPath, 'utf-8')
    const { data: frontmatter, content: body } = matter(content)
    
    return {
      frontmatter,
      content: body,
      filePath: fullPath
    }
  }

  /**
   * Записывает MDX файл с frontmatter
   */
  writeFile(filePath: string, frontmatter: any, content: string) {
    const fullPath = join(this.getDocsPath(), filePath)
    const dir = join(fullPath, '..')
    
    // Создаем директорию если не существует
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    const fileContent = matter.stringify(content, frontmatter)
    writeFileSync(fullPath, fileContent)
    
    this.logger.log(`✅ Written file: ${filePath}`)
  }

  /**
   * Получает все MDX файлы структурированно по категориям
   */
  async getContent() {
    const path = this.getDocsPath()
    const files = await globby('**/*.mdx', { cwd: path })

    const content = this.getStructurizedFilesIntoCategories(files)
    return content
  }

  /**
   * Получает список категорий из путей файлов
   */
  async getCategoriesFromPaths(paths: string[]) {
    const categories = paths.map((path) => path.split('/')[0])
    return [...new Set(categories)]
  }

  /**
   * Структурирует файлы по категориям
   */
  getStructurizedFilesIntoCategories(files: string[]) {
    const categories = files.map((path) => path.split('/')[0])
    const uniqueCategories = [...new Set(categories)]
    
    return uniqueCategories.map((category) => {
      return {
        name: category,
        files: files.filter((file) => file.startsWith(category)),
      }
    })
  }

  /**
   * Создает новый MDX файл
   */
  async createFile(filePath: string, title: string, content: string, description?: string, sidebar_position?: number) {
    const frontmatter = {
      title,
      description: description || '',
      sidebar_position: sidebar_position || 1
    }
    
    this.writeFile(filePath, frontmatter, content)
    this.logger.log(`✅ Created file: ${filePath}`)
  }

  /**
   * Обновляет существующий MDX файл
   */
  async updateFile(filePath: string, updates: { title?: string; content?: string; description?: string; sidebar_position?: number }) {
    const existing = this.readFile(filePath)
    
    const newFrontmatter = {
      ...existing.frontmatter,
      ...updates
    }
    
    // Убираем content из frontmatter если он там есть
    delete newFrontmatter.content
    
    const newContent = updates.content !== undefined ? updates.content : existing.content
    
    this.writeFile(filePath, newFrontmatter, newContent)
    this.logger.log(`✅ Updated file: ${filePath}`)
  }

  /**
   * Удаляет MDX файл
   */
  async deleteFile(filePath: string) {
    const fullPath = join(this.getDocsPath(), filePath)
    
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    
    unlinkSync(fullPath)
    this.logger.log(`✅ Deleted file: ${filePath}`)
  }

  /**
   * Переименовывает MDX файл
   */
  async renameFile(oldPath: string, newPath: string) {
    const oldFullPath = join(this.getDocsPath(), oldPath)
    const newFullPath = join(this.getDocsPath(), newPath)
    
    if (!existsSync(oldFullPath)) {
      throw new Error(`File not found: ${oldPath}`)
    }
    
    // Создаем директорию для нового пути если не существует
    const newDir = join(newFullPath, '..')
    if (!existsSync(newDir)) {
      mkdirSync(newDir, { recursive: true })
    }
    
    renameSync(oldFullPath, newFullPath)
    this.logger.log(`✅ Renamed file: ${oldPath} → ${newPath}`)
  }

  /**
   * Создает новую категорию (директорию)
   */
  async createCategory(categoryName: string) {
    const categoryPath = join(this.getDocsPath(), categoryName)
    
    if (existsSync(categoryPath)) {
      throw new Error(`Category already exists: ${categoryName}`)
    }
    
    mkdirSync(categoryPath, { recursive: true })
    
    // Создаем _category_.json файл
    const categoryJsonPath = join(categoryPath, '_category_.json')
    const categoryData = {
      label: categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      position: 1
    }
    
    writeFileSync(categoryJsonPath, JSON.stringify(categoryData, null, 2))
    this.logger.log(`✅ Created category: ${categoryName}`)
  }

  /**
   * Удаляет категорию и все файлы в ней
   */
  async deleteCategory(categoryName: string) {
    const categoryPath = join(this.getDocsPath(), categoryName)
    
    if (!existsSync(categoryPath)) {
      throw new Error(`Category not found: ${categoryName}`)
    }
    
    await deleteAsync(categoryPath)
    this.logger.log(`✅ Deleted category: ${categoryName}`)
  }

  /**
   * Переименовывает категорию
   */
  async renameCategory(oldName: string, newName: string) {
    const oldPath = join(this.getDocsPath(), oldName)
    const newPath = join(this.getDocsPath(), newName)
    
    if (!existsSync(oldPath)) {
      throw new Error(`Category not found: ${oldName}`)
    }
    
    if (existsSync(newPath)) {
      throw new Error(`Category already exists: ${newName}`)
    }
    
    renameSync(oldPath, newPath)
    
    // Обновляем _category_.json если существует
    const categoryJsonPath = join(newPath, '_category_.json')
    if (existsSync(categoryJsonPath)) {
      const categoryData = JSON.parse(readFileSync(categoryJsonPath, 'utf-8'))
      categoryData.label = newName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      writeFileSync(categoryJsonPath, JSON.stringify(categoryData, null, 2))
    }
    
    this.logger.log(`✅ Renamed category: ${oldName} → ${newName}`)
  }

  /**
   * Перемещает файл в другую категорию
   */
  async moveFileToCategory(filePath: string, newCategory: string) {
    const fileName = filePath.split('/').pop()
    if (!fileName) {
      throw new Error('Invalid file path')
    }
    const newFilePath = join(newCategory, fileName).replace(/\\/g, '/')
    
    await this.renameFile(filePath, newFilePath)
    this.logger.log(`✅ Moved file: ${filePath} → ${newFilePath}`)
  }

  isDockerOrError(): boolean {
    if (process.env.DOCKER !== 'true') {
      throw new Error("It's not a docker environment")
    }

    return true
  }

  async rebuildDocs(): Promise<void> {
    this.isDockerOrError()

    try {
      const command = 'docker-compose -f docker-compose.dev.yml up --build -d docs'

      this.logger.log('Starting docs rebuild...')
      const { stdout, stderr } = await this.execAsync(command)

      if (stdout) this.logger.log(`Rebuild output: ${stdout}`)
      if (stderr) this.logger.warn(`Rebuild warnings: ${stderr}`)

      this.logger.log('Docs rebuild completed successfully')
    } catch (error) {
      this.logger.error('Failed to rebuild docs:', error)
    }
  }
}
