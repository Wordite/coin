import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { checkMx } from '../utils/checkMx'

export function IsMailServerExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMailServerExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false
          
          const email = value as string
          const domain = email.split('@')[1]
          
          if (!domain) return false
          
          return await checkMx(domain)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must have a valid mail server`
        },
      },
    })
  }
} 