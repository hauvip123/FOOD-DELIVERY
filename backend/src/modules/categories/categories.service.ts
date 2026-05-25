import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from 'src/entity/categories.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriDto } from './dto/update-categories.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Categories) private readonly categoriesRepository: Repository<Categories>,
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
    ) { }

    async createCategories(createCategory: CreateCategoriesDto) {
        await this.findRestaurantById(createCategory.restaurantId);

        const category = this.categoriesRepository.create(createCategory);
        const savedCategory = await this.categoriesRepository.save(category);

        return {
            statusCode: 201,
            message: "Create successfully",
            data: savedCategory,
        }
    }

    async getAllCategories() {
        const categories = await this.categoriesRepository.find();

        return {
            statusCode: 200,
            message: "Get all categories successfully",
            data: categories,
        }
    }

    async updateCategories(id: number, updateCategories: UpdateCategoriDto) {
        const category = await this.findCategoryById(id);

        if (updateCategories.restaurantId) {
            await this.findRestaurantById(updateCategories.restaurantId);
        }

        Object.assign(category, updateCategories);
        const updatedCategory = await this.categoriesRepository.save(category);

        return {
            statusCode: 200,
            message: "Update successfully",
            data: updatedCategory,
        }
    }

    async deleteCategories(id: number) {
        const category = await this.findCategoryById(id);
        await this.categoriesRepository.remove(category);

        return {
            statusCode: 200,
            message: "Delete successfully",
        }
    }

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
}
