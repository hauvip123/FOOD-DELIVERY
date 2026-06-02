import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/entity/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindRestaurantsQueryDto } from './dto/find-restaurants-query.dto';


@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>
    ) { }
    async createRestaurant(dataRestaurant: CreateRestaurantDto, ownerId: number) {
        const restaurant = this.restaurantRepository.create(dataRestaurant)
        restaurant.ownerId = ownerId;
        await this.restaurantRepository.save(restaurant);
        return {
            statusCode: 201,
            message: "Restaurant created successfully",
            data: restaurant
        }
    }

    async findAll(query: FindRestaurantsQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 12;
        const skip = (page - 1) * limit;
        const sortBy = query.sortBy ?? 'createdAt';
        const sortOrder = (query.sortOrder ?? 'DESC').toUpperCase() as 'ASC' | 'DESC';

        const restaurantQuery = this.restaurantRepository.createQueryBuilder('restaurant');

        if (query.search) {
            const search = `%${query.search.trim()}%`;
            restaurantQuery.andWhere('restaurant.name LIKE :search', { search });
        }

        if (query.city) {
            restaurantQuery.andWhere('restaurant.city LIKE :city', { city: `%${query.city.trim()}%` });
        }

        if (query.address) {
            restaurantQuery.andWhere('restaurant.address LIKE :address', { address: `%${query.address.trim()}%` });
        }

        if (query.cuisine) {
            restaurantQuery.andWhere('restaurant.cuisine LIKE :cuisine', { cuisine: `%${query.cuisine.trim()}%` });
        }

        if (query.isOpen !== undefined) {
            restaurantQuery.andWhere('restaurant.isOpen = :isOpen', { isOpen: query.isOpen });
        }

        if (query.minRating !== undefined) {
            restaurantQuery.andWhere('restaurant.ratingAverage >= :minRating', { minRating: query.minRating });
        }

        if (query.maxRating !== undefined) {
            restaurantQuery.andWhere('restaurant.ratingAverage <= :maxRating', { maxRating: query.maxRating });
        }

        const [restaurants, total] = await restaurantQuery
            .orderBy(`restaurant.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            statusCode: 200,
            message: "Restaurants found successfully",
            data: restaurants,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }
    }

    async findByOwner(ownerId: number) {
        const restaurants = await this.restaurantRepository.find({ where: { ownerId } });
        return {
            statusCode: 200,
            message: "Owner restaurants found successfully",
            data: restaurants
        }
    }

    async findByid(id: number) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id } })
        if (!restaurant) {
            throw new NotFoundException("Restaurant not found")
        }
        return {
            statusCode: 200,
            message: "Restaurant found successfully",
            data: restaurant
        }
    }

    async updateRestaurant(id: number, dataRestaurant: UpdateRestaurantDto) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id } });
        if (!restaurant) {
            throw new NotFoundException("Restaurant not found")
        }
        Object.assign(restaurant, dataRestaurant);
        const updatedRestaurant = await this.restaurantRepository.save(restaurant);
        return {
            statusCode: 200,
            message: "Restaurant updated successfully",
            data: updatedRestaurant
        }
    }

    async deleteRestaurant(id: number) {
        await this.restaurantRepository.delete(id);
        return {
            statusCode: 200,
            message: "Restaurant deleted successfully"
        }
    }
}
