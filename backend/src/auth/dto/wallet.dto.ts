import { IsString, IsNotEmpty } from 'class-validator'
import { IsWalletAddress } from 'src/common/validators/is-wallet-address.validator'


class WalletDto {
  @IsString()
  @IsNotEmpty()
  @IsWalletAddress()
  address: string
}

export { WalletDto }