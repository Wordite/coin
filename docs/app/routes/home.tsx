import type { Route } from './+types/home'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { Link } from 'react-router'
import { baseOptions } from '@/lib/layout.shared'
import { useSettings } from '@/hooks/useSettings'
import { useSettingsStore } from '@/store/settings'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { getImageUrl } from '@/utils/getImageUrl'

const HomeSkeleton = () => {
  return (
    <SkeletonTheme
      baseColor='var(--color-gray-transparent-70)'
      highlightColor='var(--color-gray-transparent-10)'
    >
      <div className='min-h-screen'>
        {/* Hero Section Skeleton */}
        <div className='container mx-auto px-4 py-16 md:py-24'>
          <div className='text-center max-w-4xl mx-auto'>
            {/* Logo Skeleton */}
            <div className='mb-8'>
              <div className='inline-flex items-center justify-center w-20 h-20 mb-6'>
                <Skeleton circle height={80} width={80} />
              </div>
            </div>

            {/* Title Skeleton */}
            <div className='mb-6'>
              <Skeleton height={60} width={400} className='mx-auto mb-4' />
              <Skeleton height={40} width={300} className='mx-auto' />
            </div>

            {/* Description Skeleton */}
            <div className='mb-8'>
              <Skeleton height={24} width={600} className='mx-auto mb-2' />
              <Skeleton height={24} width={500} className='mx-auto mb-2' />
              <Skeleton height={24} width={400} className='mx-auto' />
            </div>

            {/* CTA Buttons Skeleton */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
              <Skeleton height={48} width={140} />
              <Skeleton height={48} width={160} />
            </div>

            {/* Features Grid Skeleton */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='dark:bg-[var(--color-gray-transparent-70)] p-6 rounded-2xl shadow-lg'
                >
                  <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                    <Skeleton circle height={24} width={24} />
                  </div>
                  <Skeleton height={24} width={120} className='mx-auto mb-2' />
                  <Skeleton height={16} width={200} className='mx-auto mb-1' />
                  <Skeleton height={16} width={180} className='mx-auto mb-1' />
                  <Skeleton height={16} width={160} className='mx-auto' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}

export function meta({}: Route.MetaArgs) {
  const { docsConfig } = useSettingsStore()

  return [{ title: docsConfig.title }, { name: 'description', content: docsConfig.tagline }]
}

export default function Home() {
  const { docsConfig } = useSettingsStore()
  const { isLoading } = useSettings()

  if (isLoading) {
    return (
      <HomeLayout {...baseOptions()}>
        <HomeSkeleton />
      </HomeLayout>
    )
  }

  return (
    <HomeLayout {...baseOptions()}>
      <div className='min-h-screen'>
        {/* Hero Section */}
        <div className='container mx-auto px-4 py-16 md:py-24'>
          <div className='text-center max-w-4xl mx-auto'>
            {/* Logo/Brand */}
            <div className='mb-8'>
              <div className='inline-flex items-center justify-center w-20 h-20 mb-6'>
                {docsConfig.logoSrc ? (
                  <img
                    src={getImageUrl(docsConfig.logoSrc)}
                    alt={docsConfig.navbarTitle || 'Logo'}
                    className='w-32 h-32 object-contain rounded-xl'
                  />
                ) : (
                  <Skeleton circle height={48} width={48} />
                )}
              </div>
            </div>

            {/* Main Heading */}
            <h1 className='text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight'>
              {docsConfig.title}
              <span className='block text-3xl md:text-4xl text-blue-600 dark:text-blue-400 mt-2'>
                {docsConfig.tagline}
              </span>
            </h1>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
              <Link
                to={docsConfig.buttonLink}
                className='inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                  />
                </svg>
                {docsConfig.buttonText}
              </Link>
            </div>

            {/* Features Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
              {docsConfig.feature1Title && (
                <div className='dark:bg-[var(--color-gray-transparent-70)] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200'>
                  <div className='w-12 h-12 bg-green-200 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                    {docsConfig.feature1Image ? (
                      <img
                        src={getImageUrl(docsConfig.feature1Image)}
                        alt={docsConfig.feature1Title}
                        className='w-6 h-6'
                      />
                    ) : (
                      <Skeleton circle height={48} width={48} />
                    )}
                  </div>
                  <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-2'>
                    {docsConfig.feature1Title}
                  </h3>
                  <p className='text-slate-600 dark:text-slate-300'>{docsConfig.feature1Text}</p>
                </div>
              )}

              {docsConfig.feature2Title && (
                <div className='dark:bg-[var(--color-gray-transparent-70)] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200'>
                  <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                    {docsConfig.feature2Image ? (
                      <img
                        src={getImageUrl(docsConfig.feature2Image)}
                        alt={docsConfig.feature2Title}
                        className='w-6 h-6'
                      />
                    ) : (
                      <Skeleton circle height={48} width={48} />
                    )}
                  </div>
                  <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-2'>
                    {docsConfig.feature2Title}
                  </h3>
                  <p className='text-slate-600 dark:text-slate-300'>{docsConfig.feature2Text}</p>
                </div>
              )}

              {docsConfig.feature3Title && (
                <div className='dark:bg-[var(--color-gray-transparent-70)] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200'>
                  <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                    {docsConfig.feature3Image ? (
                      <img
                        src={getImageUrl(docsConfig.feature3Image)}
                        alt={docsConfig.feature3Title}
                        className='w-6 h-6'
                      />
                    ) : (
                      <Skeleton circle height={48} width={48} />
                    )}
                  </div>
                  <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-2'>
                    {docsConfig.feature3Title}
                  </h3>
                  <p className='text-slate-600 dark:text-slate-300'>{docsConfig.feature3Text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  )
}
