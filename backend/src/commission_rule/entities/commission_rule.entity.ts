@Entity('commission_rules')
export class CommissionRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  event: string;
  
  @Column()
  type: 'fixed' | 'percentage';

  @Column('decimal')
  value: number;

  @Column({ default: true })
  active: boolean;
}