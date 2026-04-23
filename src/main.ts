import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { createServer } from 'net';
import { join } from 'path';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once('error', (error: NodeJS.ErrnoException) => {
      server.close();

      if (error.code === 'EADDRINUSE') {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port);
  });
}

async function listenOnAvailablePort(app: NestExpressApplication, startingPort: number): Promise<number> {
  const logger = new Logger('Bootstrap');
  let port = startingPort;

  while (true) {
    if (!(await isPortAvailable(port))) {
      logger.warn(`Port ${port} is already in use. Trying ${port + 1}...`);
      port += 1;
      continue;
    }

    await app.listen(port);
    return port;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve frontend static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Enable CORS for development
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:8080'], // Frontend ports
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const preferredPort = Number(process.env.PORT ?? 3000);
  const port = await listenOnAvailablePort(app, preferredPort);
  process.env.APP_PORT = String(port);
  console.log(`Campus BorrowHub API running on http://localhost:${port}`);
}
bootstrap();
