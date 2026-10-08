import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  referenceId: string; // ID da venda ou ordem de serviço de origem

  @Column('decimal', { precision: 10, scale: 2 })
  commissionValue: number;

  @Column()
  commissionRuleId: number;

  @Column({ default: 1 })
  quantity: number; // No comercial vira o total de vendas do período se for em lote, ou 1 se for por O.S.
}
