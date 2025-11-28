import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS
    app.enableCors({
        origin: 'http://localhost:5173', // Vite default port
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
    await app.listen(3000);
    console.log('Server running on port 3000');
}

bootstrap();
