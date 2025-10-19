import { loader } from 'fumadocs-core/source';
import { create, docs } from '../../source.generated';

export const source = loader({
  source: await create.sourceAsync(docs.doc, docs.meta),
  baseUrl: process.env.NODE_ENV === 'production' ? '/' : '/docs',
});
