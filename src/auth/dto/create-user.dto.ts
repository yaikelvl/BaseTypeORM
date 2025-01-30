import {
    IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  isStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enum/roles.enum';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  role?: UserRole[];
}
