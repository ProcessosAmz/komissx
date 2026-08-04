import { CommissionEvent } from '../../../common/enums/commissionEvent.enum';
import { CommissionRuleType } from '../../../common/enums/commissionRuleType.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('commission_rules')
export class CommissionRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  evento: CommissionEvent;

  @Column({ nullable: true })
  filters: string;

  @Column()
  ruleType: CommissionRuleType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valor: number;

  @Column('jsonb', { nullable: true })
  config: Record<string, unknown> | null;

  @Column({ default: true })
  ativo: boolean;
}