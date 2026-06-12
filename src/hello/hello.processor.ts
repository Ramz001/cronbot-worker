import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('hello')
export class HelloProcessor extends WorkerHost {
  private readonly logger = new Logger(HelloProcessor.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job): Promise<void> {
    this.logger.log(
      `Processing job "${job.name}" (id: ${job.id}) | Attempt #${job.attemptsMade + 1}`,
    );

    // Simulate some work
    this.logger.log(
      '👋 Hello from BullMQ! The time is:',
      new Date().toISOString(),
    );
    // Simulate random failure to demonstrate retries and backoff
    if (Math.random() < 0.3) {
      throw new Error('Simulated random failure');
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`⏳ Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`❌ Job ${job.id} failed: ${err.message}`, err.stack);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job) {
    this.logger.log(
      `📊 Job ${job.id} is ${JSON.stringify(job.progress)}% complete`,
    );
  }
}
