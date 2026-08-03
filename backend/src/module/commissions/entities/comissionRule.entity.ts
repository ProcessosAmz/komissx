// import { CommissionEvent } from "src/common/enums/commission-event.enum";
// import { CommissionRuleType } from "src/common/enums/commission-rule-type.enum";
// import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// @Entity("commission_rules")
// export class CommissionRule {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   nome: string; // Ex: "Instalação Técnica - Lobatos", "Vendas Recepção AM"

//   @Column()
//   evento: CommissionEvent; // 'instalacao' | 'retirada' | 'venda_comercial'

//   @Column({ nullable: true })
//   filters: string; // 'AM' | 'PA' (Útil para filtrar rápido por região) , ou qualequer outro filtro como equipe, empresa etc.

//   @Column()
//   ruleType: CommissionRuleType;

//   // Se for 'fixed', usamos este valor.
//   @Column("decimal", { precision: 10, scale: 2, nullable: true })
//   valor: number;

//   // Se for 'tier' ou 'pattern', guardamos a lógica flexível aqui
//   // Ex de Tier: [{"min": 60, "max": 99, "value": 5.0}, {"min": 100, "max": 130, "value": 6.0}]
//   // Ex de Pattern: {"endsWith": "Lobatos"} ou {"specificUsers": [12, 45]}
//   @Column("jsonb", { nullable: true })
//   config: any;

//   @Column({ default: true })
//   ativo: boolean;
// }
