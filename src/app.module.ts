import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { HelloModule } from './modules/hello/hello.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './common/config/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        username: 'default',
        password: 'cronbot',
      },
    }),
    HelloModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
