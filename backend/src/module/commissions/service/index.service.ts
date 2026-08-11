import { Injectable } from "@nestjs/common";
import { CreateCommissionDto } from "@/module/commissions/dto/createCommission.dto";
import { UpdateCommissionDto } from "@/module/commissions/dto/updateCommission.dto";

@Injectable()
export class CommissionsService {
  create(createCommissionDto: CreateCommissionDto) {
    void createCommissionDto;
    return "This action adds a new commission";
  }

  findAll() {
    return `This action returns all commissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commission`;
  }

  update(id: number, updateCommissionDto: UpdateCommissionDto) {
    void updateCommissionDto;
    return `This action updates a #${id} commission`;
  }

  remove(id: number) {
    return `This action removes a #${id} commission`;
  }
}
