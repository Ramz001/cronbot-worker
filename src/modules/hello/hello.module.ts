import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HelloProcessor } from './hello.processor';
import { HelloService } from './hello.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'hello',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600,
          count: 100,
        },
        removeOnFail: {
          age: 86400,
          count: 50,
        },
      },
    }),
  ],
  providers: [HelloProcessor, HelloService],
  exports: [HelloService],
})
export class HelloModule {}
