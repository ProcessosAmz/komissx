import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommissionRuleService } from './commission_rule.service';
import { CreateCommissionRuleDto } from './dto/create-commission_rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission_rule.dto';

@Controller('commission-rules')
export class CommissionRuleController {
  constructor(private readonly commissionRuleService: CommissionRuleService) {}

  @Post()
  create(@Body() createCommissionRuleDto: CreateCommissionRuleDto) {
    return this.commissionRuleService.create(createCommissionRuleDto);
  }

  @Get()
  findAll() {
    return this.commissionRuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commissionRuleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommissionRuleDto: UpdateCommissionRuleDto) {
    return this.commissionRuleService.update(+id, updateCommissionRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commissionRuleService.remove(+id);
  }
}
