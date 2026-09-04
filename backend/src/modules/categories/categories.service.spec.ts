import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from 'src/common/redis/redis.service';
import { Categories } from 'src/entity/categories.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import {
  CACHE_KEYS,
  CACHE_TTL_SECONDS,
} from 'src/common/redis/redis.constants';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    remove: jest.Mock;
  };
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
        CategoriesService,
        {
          provide: getRepositoryToken(Categories),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            remove: jest.fn(),
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

    service = module.get(CategoriesService);
    categoriesRepository = module.get(getRepositoryToken(Categories));
    restaurantRepository = module.get(getRepositoryToken(Restaurant));
    redisService = module.get(RedisService);
  });

  it('returns cached categories without querying MySQL', async () => {
    const cachedResponse = {
      statusCode: 200,
      message: 'Get all categories successfully',
      data: [{ id: 1, name: 'Rice' }] as Categories[],
    };
    redisService.get.mockResolvedValue(cachedResponse);

    await expect(service.getAllCategories()).resolves.toEqual(cachedResponse);
    expect(redisService.get).toHaveBeenCalledWith(CACHE_KEYS.categories);
    expect(categoriesRepository.find).not.toHaveBeenCalled();
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('queries MySQL and caches the response on a cache miss', async () => {
    const categories = [{ id: 1, name: 'Rice' }] as Categories[];
    redisService.get.mockResolvedValue(null);
    categoriesRepository.find.mockResolvedValue(categories);

    const response = await service.getAllCategories();

    expect(response.data).toEqual(categories);
    expect(categoriesRepository.find).toHaveBeenCalledTimes(1);
    expect(redisService.set).toHaveBeenCalledWith(
      CACHE_KEYS.categories,
      response,
      CACHE_TTL_SECONDS.categories,
    );
  });

  it('invalidates category and dish-list caches after creating a category', async () => {
    const input = { name: 'Rice', restaurantId: 1 };
    const restaurant = { id: 1 } as Restaurant;
    const category = { id: 1, ...input } as Categories;
    restaurantRepository.findOneBy.mockResolvedValue(restaurant);
    categoriesRepository.create.mockReturnValue(category);
    categoriesRepository.save.mockResolvedValue(category);

    await service.createCategories(input);

    expect(redisService.delete).toHaveBeenCalledWith(CACHE_KEYS.categories);
    expect(redisService.deleteByPattern).toHaveBeenCalledWith(
      CACHE_KEYS.dishLists,
    );
  });
});
