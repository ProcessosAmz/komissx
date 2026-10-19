import { postgresPoolConfig } from "@/database/postgresPool.config";
import * as bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env" });

const skipDatabase = process.env.SKIP_DATABASE === "true";

// Carrega as origens do .env e define fallbacks padrão para ambiente local
const envOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://10.1.125.20:8080",
  "http://172.20.80.1:5173",
];

// Remove duplicados combinando as origens do .env com os padrões
const trustedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

export const authPool = skipDatabase
  ? null
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ...postgresPoolConfig,
    });

export const auth =
  skipDatabase || !authPool
    ? null
    : betterAuth({
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        basePath: "/api/auth",
        trustedOrigins,
        database: authPool,
        emailAndPassword: {
          enabled: true,
          disableSignUp: true,
          password: {
            hash: async (password) => bcrypt.hash(password, 10),
            verify: async ({ hash, password }) => {
              const result = await bcrypt.compare(password, hash);

              console.log("[AUTH VERIFY]", {
                hash,
                result,
                passwordLength: password.length,
              });

              return result;
            },
          },
        },

        session: {
          expiresIn: 60 * 60 * 8,
          cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
          },
        },
        advanced: {
          cookiePrefix: "komissx",
        },
        user: {
          additionalFields: {
            role: { type: "string", required: true, input: false },
            active: { type: "boolean", defaultValue: true, input: false },
          },
        },
      });
