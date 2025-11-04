import React from 'react'
import { PieChart } from '@/shared/PieChart/PieChart'
import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { PieChartData } from '@/shared/PieChartData/PieChartData'
import { TokenomicsBackground } from '@/entities/TokenomicsBackground/TokenomicsBackground'
import { useSectionData } from '@/hooks/useSectionData'
import { TokenomicsSkeleton } from './ui/TokenomicsSkeleton'
import { useTransformPieChartData } from './model/useTransformPieChartData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useSettings } from '@/hooks/useSettings'
import { ReactSVG } from 'react-svg'
import { Section } from '@/services/section.service'
import { useIsDesktopSafari } from '@/hooks/useIsDesktopSafari'

const Tokenomics = React.memo(() => {
  const { data, isLoading, error } = useSectionData('Tokenomics')
  const { settings, isLoading: isSettingsLoading, error: isSettingsError } = useSettings()
  const isMobile = useIsMobile()
  const isDesktopSafari = useIsDesktopSafari()

  if (isLoading || error || isSettingsLoading || isSettingsError) {
    return <TokenomicsSkeleton />
  }

  const transformedPieChartData = useTransformPieChartData(data.piechart)
  
  return (
    <>
      {!isDesktopSafari && <TokenomicsBackground />}
      <section id='tokenomics' className='mt-[14.875rem]'>
        <SectionHead title={data.title} withUnderline underlineWidth='w-[7.813rem]' />

        <div className='flex justify-between items-center mt-[6.875rem] max-md:flex-col max-md:gap-[13rem]'>
          <div className='relative'>
            <PieChart size={isMobile ? 22 : 26.625} strokeWidth={1.5} data={transformedPieChartData} className='ml-[10rem] max-md:ml-0' />
            <ReactSVG 
              src={Section.getImageUrl(settings!.siteLogo)} 
              className='w-[13.75rem] h-[13.75rem] max-md:w-[10rem] max-md:h-[10rem] absolute top-1/2 left-[calc(50%+5rem)] max-md:left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10'
              beforeInjection={(svg) => {
                svg.removeAttribute('width')
                svg.removeAttribute('height')
              }}
            />
          </div>
          <PieChartData data={transformedPieChartData} className='mb-[3rem]' />
        </div>
      </section>
    </>
  )
})

Tokenomics.displayName = 'Tokenomics'

export { Tokenomics }
