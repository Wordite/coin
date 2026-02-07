interface MarkerCardProps {
  photo?: string
  description?: string
  apy?: number
  vip?: string
  price?: number
  onPurchase?: () => void
}

export default function MarkerCard({
  photo,
  description = 'Land parcel in Tycoin metaverse with exclusive benefits',
  apy = 60,
  vip = 'Gold',
  price = 1234,
  onPurchase
}: MarkerCardProps) {
  return (
    <div className="w-[18rem] max-md:w-[16rem] bg-gray-transparent-10 backdrop-blur-md rounded-xxl border-1 border-stroke-dark hover:border-stroke-light hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Photo Section */}
      <div className="relative h-[10rem] max-md:h-[8rem] flex items-center justify-center overflow-hidden">
        {photo ? (
          <img src={photo} alt="Land" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-[.5rem] text-white-transparent-35">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="max-md:w-[36px] max-md:h-[36px]">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[.75rem] max-md:text-[.85rem]">No image</span>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="px-[1rem] py-[.75rem] max-md:px-[.85rem] max-md:py-[.6rem] bg-gray-transparent-50 border-t border-stroke-dark">
        <p className="text-white-transparent-75 text-[.85rem] max-md:text-[.95rem] line-clamp-2 leading-snug">
          {description}
        </p>
      </div>

      {/* APY & VIP Row */}
      <div className="flex gap-[.5rem] px-[1rem] py-[.6rem] max-md:px-[.85rem] max-md:py-[.5rem]">
        <div className="flex-1 bg-gray-transparent-70 rounded-md px-[.75rem] py-[.5rem] max-md:px-[.6rem] max-md:py-[.4rem] border-1 border-stroke-dark">
          <span className="text-white-transparent-50 text-[.7rem] max-md:text-[.8rem] block">APY</span>
          <span className="font-semibold text-[1rem] max-md:text-[1.1rem] bg-clip-text text-transparent bg-[image:var(--color-gradient-green)]">{apy}%</span>
        </div>
        <div className="flex-1 bg-gray-transparent-70 rounded-md px-[.75rem] py-[.5rem] max-md:px-[.6rem] max-md:py-[.4rem] border-1 border-stroke-dark">
          <span className="text-white-transparent-50 text-[.7rem] max-md:text-[.8rem] block">VIP</span>
          <span className="text-purple-400 font-semibold text-[1rem] max-md:text-[1.1rem]">{vip}</span>
        </div>
      </div>

      {/* Price */}
      <div className="px-[1rem] py-[.5rem] max-md:px-[.85rem] max-md:py-[.4rem] text-center">
        <span className="text-white-transparent-50 text-[.75rem] max-md:text-[.85rem]">Price: </span>
        <span className="text-white font-bold text-[1.25rem] max-md:text-[1.35rem]">${price}</span>
      </div>

      {/* Purchase Button */}
      <div className="px-[1rem] pb-[1rem] pt-[.5rem] max-md:px-[.85rem] max-md:pb-[.85rem] max-md:pt-[.4rem]">
        <button
          onClick={onPurchase}
          className="w-full py-[.7rem] max-md:py-[.8rem] bg-green hover:brightness-110 text-black font-semibold text-[.95rem] max-md:text-[1.05rem] rounded-md transition-all duration-200 cursor-pointer"
        >
          Purchase
        </button>
      </div>
    </div>
  )
}
