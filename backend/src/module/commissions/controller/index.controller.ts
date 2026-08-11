import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { CommissionsService } from "../service/index.service";
import { CreateCommissionDto } from "../dto/createCommission.dto";aimport {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommissionsService } from '@/module/commissions/service/index.service';
import { CreateCommissionDto } from '@/module/commissions/dto/createCommission.dto';
import { UpdateCommissionDto } from '@/module/commissions/dto/updateCommission.dto';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  create(@Body() createCommissionDto: CreateCommissionDto) {
    return this.commissionsService.create(createCommissionDto);
  }

  @Get()
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commissionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommissionDto: UpdateCommissionDto,
  ) {
    return this.commissionsService.update(+id, updateCommissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commissionsService.remove(+id);
  }
}
import { UpdateCommissionDto } from "../dto/updateCommission.dto";

@Controller("commissions")
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post()
  create(@Body() createCommissionDto: CreateCommissionDto) {
    return this.commissionsService.create(createCommissionDto);
  }

  @Get()
  findAll() {
    return this.commissionsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.commissionsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCommissionDto: UpdateCommissionDto,
  ) {
    return this.commissionsService.update(+id, updateCommissionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.commissionsService.remove(+id);
  }
}
