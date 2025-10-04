import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class SignInEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(40)
  password: string
}
