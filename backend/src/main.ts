import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // staff-console (Vite dev server, a different origin) and the future parent app both call this
  // API directly — CORS must be open to them, not just same-origin.
  app.enableCors();

  // Enforces every DTO's class-validator decorators (e.g. LoginDto) on every request; without this
  // the decorators are inert and bad input reaches the service layer unchecked.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Failed to start Nest application', err);
  process.exit(1);
});
