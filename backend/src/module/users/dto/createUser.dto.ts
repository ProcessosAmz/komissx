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
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(6)
    password: string;
  
    @IsOptional()
    @IsInt()
    hubsoftId?: number | null;
  
    @IsInt()
    roleId: number;
  
    @IsInt()
    operadoraId: number;
  
    @IsInt()
    regionalId: number;
  
    @IsOptional()
    @IsInt()
    supervisorId?: number | null;
  
    @IsOptional()
    @IsBoolean()
    participaFechamento?: boolean;
  
    @IsOptional()
    @IsBoolean()
    active?: boolean;
  }