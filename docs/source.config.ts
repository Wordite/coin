import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import { remarkImage } from 'fumadocs-core/mdx-plugins'

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      [
        remarkImage,
        {
          external: false,
          onError: 'ignore',
        },
      ],
    ],
  },
})
