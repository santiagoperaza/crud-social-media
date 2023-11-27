import { IsNotEmpty } from 'class-validator';

export class SignInUserDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
