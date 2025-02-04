import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');

  app.setGlobalPrefix('tasks/');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Prueba Tecnica')
    .setDescription(
      'API para utilizar en la creacion de productos y listas de TODOs',
    )
    .setVersion('1.0')
    .build();
    //.setBasePath('/api/v1') //obsoleto
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false,
  });


  logger.log(`Server running on http://localhost:${envs.port}/tasks/`);
  await app.listen(envs.port);
}
bootstrap();
