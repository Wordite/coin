interface WalletStatusProps {
  isInstalled: boolean
}

const WalletStatus = ({ isInstalled }: WalletStatusProps) => {
  if (isInstalled)
    return <p className='text-[1rem] max-md:text-[1.2rem] text-white-transparent-75 ml-auto mr-[.625rem]'>Installed</p>

  return (
    <button className='text-[1rem] max-md:text-[1.2rem] ml-auto mr-[.625rem] bg-green text-black font-normal px-[.9rem] py-[.1rem] rounded-xl'>
      Install
    </button>
  )
}

export { WalletStatus }
