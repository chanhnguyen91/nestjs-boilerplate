import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate (Final)')
    .setDescription('API for a scalable backend platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/doc`);
}
bootstrap();