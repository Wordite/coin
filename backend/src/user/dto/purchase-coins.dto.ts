import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { IsWalletAddress } from '../../common/validators/is-wallet-address.validator'

export enum TransactionType {
  SOL = 'SOL',
  USDT = 'USDT'
}

export class PurchaseCoinsDto {
  @IsString()
  @IsNotEmpty()
  @IsWalletAddress()
  address: string

  @IsString()
  @IsNotEmpty()
  signature: string

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType

  @IsOptional()
  @IsNumber()
  amount?: number
}
