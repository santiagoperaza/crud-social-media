import { IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  firstName: string;
  lastName: string;

  @IsOptional()
  @MinLength(8, {
    message: 'Password must contain at least 8 digits',
  })
  password: string;
}
