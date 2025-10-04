import styles from './PieChartDataItem.module.scss'

interface PieChartDataItemProps {
  name: string
  percentage: number
  color: string
  countOfTokens: string
  className?: string
}

const PieChartDataItem = ({ name, percentage, color, countOfTokens, className = '' }: PieChartDataItemProps) => {
  return (
    <div className={`${styles.item} ${className}`} style={{ '--hover-color': color } as React.CSSProperties}>
      <div className='flex group items-end'>
        <p
          className={`${styles.percentage} min-w-[5rem] max-md:min-w-[6rem] text-[1.688rem] max-md:text-[1.8rem] font-semibold text-shadow-[0_0_0_transparent] text-white-transparent-10 group-hover:text-[var(--hover-color)] duration-300`}
        >
          {percentage}%
        </p>
        <p className={`${styles.subtitle} ml-[1rem] max-md:ml-[1rem] text-[1.688rem] max-md:text-[1.8rem] font-semibold text-white-transparent-10 group-hover:text-white duration-300`}>{name}</p>
        <p className='text-[.75rem] max-md:text-[1rem] ml-auto max-md:pl-[2rem] text-white-transparent-10 group-hover:text-white-transparent-35 duration-300'>{countOfTokens} tokens</p>
      </div>

      <div className={`${styles.underline} h-[0.188rem] max-md:h-[0.25rem] mt-[.625rem] max-md:mt-[0.8rem] w-full bg-[image:var(--color-gradient-white-dark)] group-hover:bg-[image:var(--color-gradient-purple-blue-4)] duration-300`} />
    </div>
  )
}

export { PieChartDataItem, type PieChartDataItemProps }
