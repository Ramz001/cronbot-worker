import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class HelloService implements OnModuleInit {
  private readonly logger = new Logger(HelloService.name);

  constructor(@InjectQueue('hello') private readonly helloQueue: Queue) {}

  async onModuleInit() {
    await this.scheduleHelloJob();
  }

  /**
   * Schedules a repeatable "hello" job that runs every minute
   * using a cron expression.
   *
   * BullMQ repeatable jobs are idempotent — calling this method
   * multiple times will not create duplicate schedules.
   */
  async scheduleHelloJob(): Promise<void> {
    const job = await this.helloQueue.upsertJobScheduler(
      'hello-every-minute', // unique scheduler key
      {
        pattern: '* * * * *', // every minute (cron syntax)
        tz: 'UTC',
      },
      {
        name: 'say-hello',
        data: {
          message: 'Hello from BullMQ!',
          timestamp: new Date().toISOString(),
        },
        opts: {
          attempts: 3, // retry up to 3 times on failure
          backoff: {
            type: 'exponential',
            delay: 2000, // start at 2s, then 4s, then 8s…
          },
          removeOnComplete: {
            age: 3600, // keep completed jobs for 1 hour
            count: 100, // keep last 100 completed jobs
          },
          removeOnFail: {
            age: 86400, // keep failed jobs for 24 hours
            count: 50, // keep last 50 failed jobs
          },
        },
      },
    );

    this.logger.log(
      `🕐 Scheduled repeatable job "${job.name}" (id: ${job.id}) — next run follows cron: * * * * *`,
    );
  }

  /**
   * Manually enqueue a one-off hello job (useful for testing).
   */
  async sayHelloNow(): Promise<void> {
    const job = await this.helloQueue.add('say-hello', {
      message: 'Manual hello from BullMQ!',
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`🚀 Manually enqueued job ${job.id}`);
  }

  /**
   * Remove the repeatable schedule (stops the cron).
   */
  async stopHelloJob(): Promise<void> {
    await this.helloQueue.removeJobScheduler('hello-every-minute');
    this.logger.log('🛑 Removed hello-every-minute scheduler');
  }
}
