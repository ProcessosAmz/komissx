import { Injectable } from "@nestjs/common";
import { CreateRoleDto } from "@/module/roles/dto/create.role.dto";
import { UpdateRoleDto } from "@/module/roles/dto/update.role.dto";

@Injectable()
export class RolesService {
  create(createRoleDto: CreateRoleDto) {
    void createRoleDto;
    return "This action adds a new role";
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    void updateRoleDto;
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
