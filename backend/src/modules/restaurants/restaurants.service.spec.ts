import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from 'src/common/redis/redis.service';
import { CACHE_KEYS } from 'src/common/redis/redis.constants';
import { FavoriteRestaurant } from 'src/entity/favorite-restaurant.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let restaurantRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let redisService: {
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
    deleteByPattern: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FavoriteRestaurant),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            deleteByPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RestaurantsService);
    restaurantRepository = module.get(getRepositoryToken(Restaurant));
    redisService = module.get(RedisService);
  });

  it('returns a cached restaurant without querying MySQL', async () => {
    const cachedResponse = {
      statusCode: 200,
      message: 'Restaurant found successfully',
      data: { id: 1, name: 'Pho 24' } as Restaurant,
    };
    redisService.get.mockResolvedValue(cachedResponse);

    await expect(service.findByid(1)).resolves.toEqual(cachedResponse);
    expect(redisService.get).toHaveBeenCalledWith(
      CACHE_KEYS.restaurantDetail(1),
    );
    expect(restaurantRepository.findOne).not.toHaveBeenCalled();
  });

  it('does not cache a missing restaurant', async () => {
    redisService.get.mockResolvedValue(null);
    restaurantRepository.findOne.mockResolvedValue(null);

    await expect(service.findByid(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('invalidates restaurant and dish caches after creating a restaurant', async () => {
    const restaurant = { id: 4, name: 'Pho 24' } as Restaurant;
    restaurantRepository.create.mockReturnValue(restaurant);
    restaurantRepository.save.mockResolvedValue(restaurant);

    await service.createRestaurant(
      {
        name: 'Pho 24',
        address: '1 Nguyen Hue',
        city: 'Ho Chi Minh',
        cuisine: 'Pho',
        openTime: '08:00',
        closeTime: '22:00',
      },
      1,
    );

    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.restaurantLists,
    );
    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.dishLists,
    );
  });

  it('invalidates detail, list, and dish caches after updating a restaurant', async () => {
    const restaurant = { id: 4, name: 'Pho 24' } as Restaurant;
    restaurantRepository.findOne.mockResolvedValue(restaurant);
    restaurantRepository.save.mockResolvedValue(restaurant);

    await service.updateRestaurant(4, { name: 'Pho 24h' });

    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.restaurantLists,
    );
    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.dishLists,
    );
    expect(redisService.delete).toHaveBeenCalledWith(
      CACHE_KEYS.restaurantDetail(4),
      CACHE_KEYS.dishesByRestaurant(4),
    );
  });

  it('invalidates related caches after deleting a restaurant', async () => {
    restaurantRepository.delete.mockResolvedValue({ affected: 1 });

    await service.deleteRestaurant(4);

    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.restaurantLists,
    );
    expect(redisService.delete).toHaveBeenCalledWith(
      CACHE_KEYS.restaurantDetail(4),
      CACHE_KEYS.dishesByRestaurant(4),
    );
  });
});
