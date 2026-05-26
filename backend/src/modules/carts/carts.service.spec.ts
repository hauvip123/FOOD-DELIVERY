import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartItems } from 'src/entity/cart-items.entity';
import { Carts } from 'src/entity/carts.entity';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let service: CartsService;
  const repositoryMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: getRepositoryToken(Carts),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(CartItems),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
