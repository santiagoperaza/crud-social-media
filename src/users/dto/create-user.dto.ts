import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @MinLength(8, {
    message: 'Password must contain at least 8 digits',
  })
  @IsNotEmpty()
  password: string;
}
