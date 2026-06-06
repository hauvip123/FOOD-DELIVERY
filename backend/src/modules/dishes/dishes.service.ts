import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categories } from 'src/entity/categories.entity';
import { Dish } from 'src/entity/dish.entiry';
import { Restaurant } from 'src/entity/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { FindDishesQueryDto } from './dto/find-dishes-query.dto';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>,
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  private async findCategoryById(id: number) {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
  private async findRestaurantById(id: number) {
    const restaurant = await this.restaurantRepository.findOneBy({ id });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async createDishes(createDish: CreateDishDto) {
    await this.findCategoryById(createDish.categoryId);
    await this.findRestaurantById(createDish.restaurantId);

    const dish = this.dishRepository.create(createDish);
    const savedDish = await this.dishRepository.save(dish);

    return {
      statusCode: 201,
      message: 'Create successfully',
      data: savedDish,
    };
  }

  async getAllDishes(query: FindDishesQueryDto = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = (query.sortOrder ?? 'DESC').toUpperCase() as
      | 'ASC'
      | 'DESC';

    const dishQuery = this.dishRepository
      .createQueryBuilder('dish')
      .leftJoinAndSelect('dish.restaurant', 'restaurant')
      .leftJoinAndSelect('dish.category', 'category');

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      dishQuery.andWhere(
        '(dish.name LIKE :search OR dish.description LIKE :search OR restaurant.name LIKE :search)',
        { search },
      );
    }

    if (query.categoryId !== undefined) {
      dishQuery.andWhere('dish.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.categoryName) {
      dishQuery.andWhere('category.name = :categoryName', {
        categoryName: query.categoryName.trim(),
      });
    }

    if (query.isAvailable !== undefined) {
      dishQuery.andWhere('dish.isAvailable = :isAvailable', {
        isAvailable: query.isAvailable,
      });
    }

    const [dishes, total] = await dishQuery
      .orderBy(`dish.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      statusCode: 200,
      message: 'Get all dishes successfully',
      data: dishes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDishById(id: number) {
    const dish = await this.dishRepository.findOneBy({ id });
    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    return {
      statusCode: 200,
      message: 'Get dish successfully',
      data: dish,
    };
  }

  async getDishByRestaurantId(id: number) {
    await this.findRestaurantById(id);
    const dishes = await this.dishRepository.find({
      where: { restaurantId: id },
    });
    return {
      statusCode: 200,
      message: 'Get dish by restaurant successfully',
      data: dishes,
    };
  }
  async updateDish(id: number, updateDish: UpdateDishDto) {
    const dish = await this.dishRepository.findOneBy({ id });
    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    if (updateDish.categoryId) {
      await this.findCategoryById(updateDish.categoryId);
    }

    if (updateDish.restaurantId) {
      await this.findRestaurantById(updateDish.restaurantId);
    }

    Object.assign(dish, updateDish);
    const updatedDish = await this.dishRepository.save(dish);

    return {
      statusCode: 200,
      message: 'Update successfully',
      data: updatedDish,
    };
  }

  async deleteDish(id: number) {
    const dish = await this.dishRepository.findOneBy({ id });
    if (!dish) {
      throw new NotFoundException('Dish not found');
    }
    await this.dishRepository.remove(dish);

    return {
      statusCode: 200,
      message: 'Delete successfully',
    };
  }
}
