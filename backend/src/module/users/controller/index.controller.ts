// import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, BadRequestException } from '@nestjs/common';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Controller('users')
// export class UsersController {
//   private readonly logger = new Logger(UsersController.name);
//   constructor(private readonly usersService: UsersService) {}

//   @Post()
//   async create(@Body() createUserDto: CreateUserDto) {
//     try{
//       this.logger.log('Received request to create a new user',);
//       const user = await this.usersService.create(createUserDto);
//       return user;
//     } catch (error) {
//       this.logger.error(error);
//       // TODO: Handle error properly
//     }
//   }

//   @Get()
//   findAll() {
//     return this.usersService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.usersService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
//     return this.usersService.update(+id, updateUserDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(+id);
//   }
// }
