import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly cacheEnabled: boolean;
  private readonly keyPrefix: string;

  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    configService: ConfigService,
  ) {
    this.cacheEnabled =
      configService.get<string>('REDIS_CACHE_ENABLED', 'true') === 'true';
    this.keyPrefix = configService.get<string>(
      'REDIS_KEY_PREFIX',
      'hungerdash',
    );
  }

  private toKey(key: string) {
    return `${this.keyPrefix}:${key}`;
  }

  private logError(operation: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(`Redis ${operation} error: ${message}`);
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.cacheEnabled) {
      return null;
    }
    try {
      const value = await this.client.get(this.toKey(key));
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logError('read', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.cacheEnabled) {
      return;
    }
    try {
      await this.client.set(
        this.toKey(key),
        JSON.stringify(value),
        'EX',
        ttlSeconds,
      );
    } catch (error) {
      this.logError('write', error);
    }
  }

  async delete(...keys: string[]): Promise<void> {
    if (!this.cacheEnabled || keys.length === 0) {
      return;
    }
    try {
      await this.client.del(...keys.map((key) => this.toKey(key)));
    } catch (error) {
      this.logError('delete', error);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.cacheEnabled) {
      return;
    }
    try {
      const stream = this.client.scanStream({
        match: this.toKey(pattern),
        count: 100,
      });
      for await (const keys of stream) {
        const matchedKeys = keys as string[];
        if (matchedKeys.length > 0) {
          await this.client.del(...matchedKeys);
        }
      }
    } catch (error) {
      this.logError('deleteByPattern', error);
    }
  }

  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch (error) {
      this.logError('ping', error);
      return false;
    }
  }
}
