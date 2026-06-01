import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/entity/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';


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

    async findAll() {
        const restaurant = await this.restaurantRepository.find();
        return {
            statusCode: 200,
            message: "Restaurants found successfully",
            data: restaurant
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
