import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let client: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    ping: jest.Mock;
    scanStream: jest.Mock;
  };
  let service: RedisService;

  const createConfigService = (cacheEnabled = 'true') =>
    ({
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'REDIS_CACHE_ENABLED') {
          return cacheEnabled;
        }
        if (key === 'REDIS_KEY_PREFIX') {
          return 'hungerdash:test';
        }
        return defaultValue;
      }),
    }) as unknown as ConfigService;

  beforeEach(() => {
    client = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      ping: jest.fn(),
      scanStream: jest.fn(),
    };

    service = new RedisService(
      client as unknown as Redis,
      createConfigService(),
    );
  });

  it('reads and parses a prefixed cache key', async () => {
    client.get.mockResolvedValue(JSON.stringify({ id: 1 }));

    await expect(service.get('categories:all')).resolves.toEqual({ id: 1 });
    expect(client.get).toHaveBeenCalledWith('hungerdash:test:categories:all');
  });

  it('writes JSON with a TTL and prefix', async () => {
    client.set.mockResolvedValue('OK');

    await service.set('categories:all', [{ id: 1 }], 1800);

    expect(client.set).toHaveBeenCalledWith(
      'hungerdash:test:categories:all',
      JSON.stringify([{ id: 1 }]),
      'EX',
      1800,
    );
  });

  it('returns null when Redis read fails', async () => {
    client.get.mockRejectedValue(new Error('Redis unavailable'));

    await expect(service.get('categories:all')).resolves.toBeNull();
  });

  it('deletes all provided keys with the configured prefix', async () => {
    client.del.mockResolvedValue(2);

    await service.delete('categories:all', 'dishes:detail:1');

    expect(client.del).toHaveBeenCalledWith(
      'hungerdash:test:categories:all',
      'hungerdash:test:dishes:detail:1',
    );
  });

  it('scans and deletes keys matching a prefixed pattern', async () => {
    const batches = [
      ['hungerdash:test:dishes:list:first'],
      [],
      ['hungerdash:test:dishes:list:second'],
    ];
    const stream = {
      [Symbol.asyncIterator]() {
        let index = 0;
        return {
          next: () =>
            Promise.resolve(
              index < batches.length
                ? { value: batches[index++], done: false as const }
                : { value: undefined, done: true as const },
            ),
        };
      },
    };
    client.scanStream.mockReturnValue(stream);
    client.del.mockResolvedValue(1);

    await service.deleteByPattern('dishes:list:*');

    expect(client.scanStream).toHaveBeenCalledWith({
      match: 'hungerdash:test:dishes:list:*',
      count: 100,
    });
    expect(client.del).toHaveBeenCalledTimes(2);
    expect(client.del).toHaveBeenNthCalledWith(
      1,
      'hungerdash:test:dishes:list:first',
    );
    expect(client.del).toHaveBeenNthCalledWith(
      2,
      'hungerdash:test:dishes:list:second',
    );
  });

  it('skips cache operations when caching is disabled', async () => {
    service = new RedisService(
      client as unknown as Redis,
      createConfigService('false'),
    );

    await expect(service.get('categories:all')).resolves.toBeNull();
    await service.set('categories:all', [], 1800);
    await service.delete('categories:all');
    await service.deleteByPattern('dishes:list:*');

    expect(client.get).not.toHaveBeenCalled();
    expect(client.set).not.toHaveBeenCalled();
    expect(client.del).not.toHaveBeenCalled();
    expect(client.scanStream).not.toHaveBeenCalled();
  });

  it('returns the Redis health status', async () => {
    client.ping.mockResolvedValue('PONG');
    await expect(service.ping()).resolves.toBe(true);

    client.ping.mockRejectedValue(new Error('Redis unavailable'));
    await expect(service.ping()).resolves.toBe(false);
  });
});
