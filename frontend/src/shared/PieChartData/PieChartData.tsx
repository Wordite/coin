import { PieChartDataItem, type PieChartDataItemProps } from "../PieChartDataItem/PieChartDataItem"

interface PieChartDataProps {
  data: PieChartDataItemProps[]
  className?: string
}

const PieChartData = ({ data, className = '' }: PieChartDataProps) => {
  return (
    <div className={`flex flex-col gap-[1.57rem] ${className}`}>
      {data.map((item) => (
        <PieChartDataItem key={item.name} {...item} />
      ))}
    </div>
  )
}

export { PieChartData }