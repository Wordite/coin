import { useHeaderStore } from '@/app/store/headerStore'

const Burger = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useHeaderStore()

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className='hamburger-menu relative w-[2.5rem] h-[2.5rem] cursor-pointer'>
      <input id='menu__toggle' type='checkbox' checked={isMobileMenuOpen} onChange={toggleMenu} />
      <label className='menu__btn' onClick={toggleMenu}>
        <span></span>
      </label>
    </div>
  )
}

export { Burger }
