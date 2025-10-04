import { PublicKey } from '@solana/web3.js'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class IsWalletAddressConstraint implements ValidatorConstraintInterface {
  validate(walletAddress: any, args: ValidationArguments) {
    if (typeof walletAddress !== 'string') {
      return false
    }

    try {
      new PublicKey(walletAddress)
      return true
    } catch (error) {
      return false
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid Solana wallet address'
  }
}

export function IsWalletAddress(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsWalletAddressConstraint,
    })
  }
}
