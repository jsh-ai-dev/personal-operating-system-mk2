import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  app.enableCors({
    origin: corsOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  });

  app.setGlobalPrefix("api");

  // `AppModule`이 `backend/.env`를 로드하면 `PORT=3001`(API)이 섞일 수 있어 listen 에는 쓰지 않음.
  const port = Number(process.env.AUTH_SERVICE_PORT ?? 3002);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
