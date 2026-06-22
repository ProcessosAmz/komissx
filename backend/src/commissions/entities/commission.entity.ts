@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  referenceId: string; // venda, atendimento etc

  @Column('decimal')
  commissionValue: number;

  @Column()
  commissionRuleId: number;
}