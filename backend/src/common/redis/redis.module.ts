import {
  Global,
  Logger,
  Module,
  Inject,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new Redis(
          configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
          {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => Math.min(times * 200, 2000),
          },
        );

        const logger = new Logger('Redis');
        client.on('error', (error) => {
          logger.warn(`Connection error: ${error.message}`);
        });

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async onApplicationShutdown() {
    if (this.client.status === 'end') {
      return;
    }
    if (this.client.status === 'wait') {
      this.client.disconnect();
      return;
    }
    await this.client.quit();
  }
}
