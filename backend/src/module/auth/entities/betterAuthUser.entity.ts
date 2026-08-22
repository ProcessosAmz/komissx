import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "user" })
export class BetterAuthUser {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ name: "emailVerified", type: "boolean" })
  emailVerified: boolean;

  @Column({ type: "text", nullable: true })
  image: string | null;

  @Column({ name: "createdAt", type: "timestamptz" })
  createdAt: Date;

  @Column({ name: "updatedAt", type: "timestamptz" })
  updatedAt: Date;

  @Column({ type: "text" })
  role: string;

  @Column({ type: "boolean" })
  active: boolean;
}
