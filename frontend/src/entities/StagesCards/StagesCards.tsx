import { StagesCard } from "@/entities/StagesCard/StagesCard"
import { useSectionData } from "@/hooks/useSectionData"

const StagesCards = () => {
  const { data } = useSectionData('StagesPricing')

  return (
    <div className='flex gap-[1.25rem] mt-[3.125rem] justify-center max-md:flex-col max-md:items-center max-md:gap-[2rem]'>
      {data.stages.map(({ textField1: title, textField2: price, textField3: countOfTokens }: { textField1: string, textField2: string, textField3: string }) => (
        <StagesCard key={title} title={title} price={price} countOfTokens={countOfTokens} />
      ))}
    </div>
  )
}

export { StagesCards }