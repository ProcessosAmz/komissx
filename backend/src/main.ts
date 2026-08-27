import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { toNodeHandler } from "better-auth/node";
import { AppModule } from "@/app.module";
import { setupSwagger } from "@/config/swagger.config";
import { auth } from "@/module/auth/better-auth";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableShutdownHooks();

  const corsOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (corsOrigins.length === 0) {
    logger.warn("CORS_ORIGINS vazio — nenhuma origem liberada");
  }

  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  const expressApp = app.getHttpAdapter().getInstance();
  if (auth) {
    expressApp.all("/api/auth/{*any}", toNodeHandler(auth));
  }
  expressApp.use(json());
  expressApp.use(urlencoded({ extended: true }));

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  const hostName = process.env.HOST_NAME ?? "localhost";
  const port = process.env.PORT_NEST ?? "3000";
  const version = process.env.APP_VERSION ?? "0.0.0";

  await app.listen(port);

  logger.log(`API em: http://${hostName}:${port}/api`);
  logger.log(`Swagger em: http://${hostName}:${port}/api`);
  logger.log(`Versão: ${version}`);
}

bootstrap();