import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "account" })
export class BetterAuthAccount {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ name: "accountId", type: "text" })
  accountId: string;

  @Column({ name: "providerId", type: "text" })
  providerId: string;

  @Column({ type: "text" })
  issuer: string;

  @Column({ name: "userId", type: "text" })
  userId: string;

  @Column({ name: "accessToken", type: "text", nullable: true })
  accessToken: string | null;

  @Column({ name: "refreshToken", type: "text", nullable: true })
  refreshToken: string | null;

  @Column({ name: "idToken", type: "text", nullable: true })
  idToken: string | null;

  @Column({ name: "accessTokenExpiresAt", type: "timestamptz", nullable: true })
  accessTokenExpiresAt: Date | null;

  @Column({ name: "refreshTokenExpiresAt", type: "timestamptz", nullable: true })
  refreshTokenExpiresAt: Date | null;

  @Column({ type: "text", nullable: true })
  scope: string | null;

  @Column({ type: "text", nullable: true })
  password: string | null;

  @Column({ name: "createdAt", type: "timestamptz" })
  createdAt: Date;

  @Column({ name: "updatedAt", type: "timestamptz" })
  updatedAt: Date;
}
