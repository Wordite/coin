import { useWalletModalStore } from '@/app/store/walletModalStore'
import { useEffect, useState, useRef } from 'react'
import CrossIcon from '@/assets/icons/cross.svg'
import styles from './SelectWalletModal.module.scss'
import { SelectWalletItem } from '@/features/SelectWalletItem/SelectWalletItem'
import { Wallets } from '@/services/wallets.service'
import { Loading } from './ui/Loading'
import { useDisableScroll } from '@/hooks/useDisableScroll'

const SelectWalletModal = () => {
  const { isOpen, setIsOpen, isLoading } = useWalletModalStore()
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { disableScroll, enableScroll } = useDisableScroll()
  const walletListRef = useRef<HTMLDivElement>(null)

  const filteredWallets = Object.keys(Wallets.adapters).filter((walletKey) => {
    const wallet = Wallets.adapters[walletKey as keyof typeof Wallets.adapters]
    const walletName = wallet.name.toLowerCase()
    const query = searchQuery.toLowerCase()
    return walletName.includes(query)
  })

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // disableScroll()

      setTimeout(() => {
        document.body.querySelector('.' + styles.modalOverlay)?.classList.add(styles.open)
        document.body.querySelector('.' + styles.modalContent)?.classList.add(styles.open)
      }, 10)
    } else {
      document.body.querySelector('.' + styles.modalOverlay)?.classList.remove(styles.open)
      document.body.querySelector('.' + styles.modalContent)?.classList.remove(styles.open)

      // enableScroll()
      setSearchQuery('')
  
      setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (walletListRef.current && walletListRef.current.contains(e.target as Node)) {
        e.stopPropagation()
        walletListRef.current.scrollTop += e.deltaY
        e.preventDefault()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('wheel', handleWheel)
      }
    }
  }, [isOpen, setIsOpen])

  if (!isVisible) return null

  return (
    <>
      <div
        className={`${styles.modalOverlay} fixed left-0 top-0 w-full h-full bg-black/50 z-[29000] backdrop-blur-md`}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`${styles.modalContent} text-[1.25rem] p-[1.563rem] fixed left-1/2 top-1/2 overflow-hidden z-[30000] w-[31.625rem] h-[35rem] bg-gray-transparent-70 rounded-xxl border-1 border-stroke-light max-md:w-[90%] max-md:h-[90dvh] max-md:p-[1.5rem] max-md:text-[1.125rem]`}
      >
        {isLoading && <Loading />}

        <div className='flex justify-between items-center max-md:mb-2'>
          <p className='font-semibold max-md:text-[2rem] max-md:h-[3rem]'>Select wallet</p>
          <div 
            className='cursor-pointer w-[1.25rem] h-[1.25rem] max-md:w-[2rem] max-md:h-[2rem] hover:scale-110 transition-all duration-300 [&>path]:fill-white'
            onClick={() => setIsOpen(false)}
          >
            <CrossIcon className='w-full h-full' />
          </div>
        </div>

        <div className='mt-6 max-md:mt-4'>
          <input
            type='text'
            placeholder='Search wallets...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-3 max-md:px-6 max-md:py-4 bg-gray-transparent-50 border border-stroke-dark rounded-md text-white placeholder-white-transparent-75 focus:outline-none focus:border-stroke-light transition-all duration-300 max-md:text-[1.5rem]'
            autoFocus
          />
        </div>

        <div
          ref={walletListRef}
          className={`${styles.walletList} mt-4 flex flex-col gap-[.625rem] max-md:pb-[0.5rem] overflow-y-auto max-h-[25rem] max-md:max-h-[calc(90dvh-12rem)] max-md:gap-[.5rem]`}
        >
          {filteredWallets.length > 0 ? (
            filteredWallets.map((walletKey) => (
              <SelectWalletItem key={walletKey} wallet={walletKey as keyof typeof Wallets.adapters} />
            ))
          ) : (
            <div className='text-center py-8 text-gray-400 max-md:py-6'>
              <p className='max-md:text-[2rem]'>No wallets found</p>
              <p className='text-sm mt-2 max-md:text-[1rem] max-md:mt-1'>Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export { SelectWalletModal }
