import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { Match } from '../../common/decorators/match.decorator'
import { IsMailServerExists } from '../../common/validators/is-mail-server-exists.validator'

export class SignUpEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @IsMailServerExists({ message: 'Email domain does not have a valid mail server' })
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(40)
  password: string

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string
}
