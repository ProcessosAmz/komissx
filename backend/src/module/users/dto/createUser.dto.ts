import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jessica Martins' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jessica@amazonet.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 12345, nullable: true })
  @IsInt()
  @IsNotEmpty()
  hubsoftId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  roleId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  operadoraId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  regionalId: number;

  @ApiPropertyOptional({ example: 10, nullable: true })
  @IsOptional()
  @IsInt()
  supervisorId?: number | null;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  participaFechamento?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}