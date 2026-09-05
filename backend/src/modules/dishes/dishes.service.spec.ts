import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from 'src/common/redis/redis.service';
import {
  CACHE_KEYS,
  CACHE_TTL_SECONDS,
} from 'src/common/redis/redis.constants';
import { hashDishListQuery } from 'src/common/redis/cache-key.util';
import { Categories } from 'src/entity/categories.entity';
import { Dish } from 'src/entity/dish.entiry';
import { Restaurant } from 'src/entity/restaurant.entity';
import { DishesService } from './dishes.service';

describe('DishesService', () => {
  let service: DishesService;
  let dishRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let categoriesRepository: { findOneBy: jest.Mock };
  let restaurantRepository: { findOneBy: jest.Mock };
  let redisService: {
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
    deleteByPattern: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishesService,
        {
          provide: getRepositoryToken(Dish),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Categories),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: {
            findOneBy: jest.fn(),
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

    service = module.get(DishesService);
    dishRepository = module.get(getRepositoryToken(Dish));
    categoriesRepository = module.get(getRepositoryToken(Categories));
    restaurantRepository = module.get(getRepositoryToken(Restaurant));
    redisService = module.get(RedisService);
  });

  it('returns a cached dish without querying MySQL', async () => {
    const cachedResponse = {
      statusCode: 200,
      message: 'Get dish successfully',
      data: { id: 1, name: 'Pho' } as Dish,
    };
    redisService.get.mockResolvedValue(cachedResponse);

    await expect(service.getDishById(1)).resolves.toEqual(cachedResponse);
    expect(redisService.get).toHaveBeenCalledWith(CACHE_KEYS.dishDetail(1));
    expect(dishRepository.findOneBy).not.toHaveBeenCalled();
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('queries MySQL and caches a dish on a cache miss', async () => {
    const dish = { id: 1, name: 'Pho' } as Dish;
    redisService.get.mockResolvedValue(null);
    dishRepository.findOneBy.mockResolvedValue(dish);

    const response = await service.getDishById(1);

    expect(response.data).toEqual(dish);
    expect(redisService.set).toHaveBeenCalledWith(
      CACHE_KEYS.dishDetail(1),
      response,
      CACHE_TTL_SECONDS.dishDetail,
    );
  });

  it('does not cache a missing dish', async () => {
    redisService.get.mockResolvedValue(null);
    dishRepository.findOneBy.mockResolvedValue(null);

    await expect(service.getDishById(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('returns cached dish lists without querying MySQL', async () => {
    const cachedResponse = {
      statusCode: 200,
      message: 'Get all dishes successfully',
      data: [],
      meta: { page: 1, limit: 24, total: 0, totalPages: 0 },
    };
    redisService.get.mockResolvedValue(cachedResponse);

    await expect(service.getAllDishes({ page: 1, limit: 24 })).resolves.toEqual(
      cachedResponse,
    );
    expect(redisService.get).toHaveBeenCalledWith(
      CACHE_KEYS.dishList(hashDishListQuery({ page: 1, limit: 24 })),
    );
    expect(dishRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('invalidates list and restaurant caches after creating a dish', async () => {
    const input = {
      name: 'Pho',
      price: 45000,
      categoryId: 2,
      restaurantId: 4,
    };
    const dish = { id: 1, ...input } as Dish;
    categoriesRepository.findOneBy.mockResolvedValue({ id: 2 });
    restaurantRepository.findOneBy.mockResolvedValue({ id: 4 });
    dishRepository.create.mockReturnValue(dish);
    dishRepository.save.mockResolvedValue(dish);

    await service.createDishes(input);

    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.dishLists,
    );
    expect(redisService.delete).toHaveBeenCalledWith(
      CACHE_KEYS.dishesByRestaurant(4),
    );
  });

  it('invalidates old and new restaurant caches when a dish moves', async () => {
    const existingDish = {
      id: 1,
      restaurantId: 4,
      categoryId: 2,
      name: 'Pho',
    } as Dish;
    dishRepository.findOneBy.mockResolvedValue(existingDish);
    restaurantRepository.findOneBy.mockResolvedValue({ id: 9 });
    dishRepository.save.mockImplementation((value: Dish) =>
      Promise.resolve(value),
    );

    await service.updateDish(1, { restaurantId: 9 });

    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.dishLists,
    );
    expect(redisService.delete).toHaveBeenCalledWith(
      CACHE_KEYS.dishDetail(1),
      CACHE_KEYS.dishesByRestaurant(4),
      CACHE_KEYS.dishesByRestaurant(9),
    );
  });

  it('invalidates detail, list, and restaurant caches after deleting a dish', async () => {
    const dish = { id: 1, restaurantId: 4 } as Dish;
    dishRepository.findOneBy.mockResolvedValue(dish);
    dishRepository.remove.mockResolvedValue(dish);

    await service.deleteDish(1);

    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.dishLists,
    );
    expect(redisService.delete).toHaveBeenCalledWith(
      CACHE_KEYS.dishDetail(1),
      CACHE_KEYS.dishesByRestaurant(4),
    );
  });
});
