import { type RouteConfig, index, route } from '@react-router/dev/routes';

const isProduction = process.env.NODE_ENV === 'production';

export default [
  index('routes/home.tsx'),
  route(isProduction ? '*' : 'docs/*', 'docs/page.tsx'),
  route('api/search', 'docs/search.ts'),
] satisfies RouteConfig;
