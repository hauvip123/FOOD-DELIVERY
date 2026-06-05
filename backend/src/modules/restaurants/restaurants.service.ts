import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteRestaurant } from 'src/entity/favorite-restaurant.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindRestaurantsQueryDto } from './dto/find-restaurants-query.dto';


@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
        @InjectRepository(FavoriteRestaurant) private readonly favoriteRestaurantRepository: Repository<FavoriteRestaurant>
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

    async findAllAdmin() {
        const restaurants = await this.restaurantRepository.find({
            relations: {
                owner: true,
            },
            order: { createdAt: 'DESC' },
        });

        // Fetch counts for all owners in this list
        const ownerIds = Array.from(new Set(restaurants.map(r => r.ownerId).filter(id => id !== null)));
        
        let ownerCounts: Record<number, number> = {};
        if (ownerIds.length > 0) {
            const counts = await this.restaurantRepository
                .createQueryBuilder('restaurant')
                .select('restaurant.ownerId', 'ownerId')
                .addSelect('COUNT(restaurant.id)', 'count')
                .where('restaurant.ownerId IN (:...ownerIds)', { ownerIds })
                .groupBy('restaurant.ownerId')
                .getRawMany();
            
            ownerCounts = counts.reduce((acc, curr) => {
                acc[curr.ownerId] = parseInt(curr.count);
                return acc;
            }, {});
        }

        const data = restaurants.map(res => ({
            ...res,
            ownerRestaurantsCount: res.ownerId ? (ownerCounts[res.ownerId] || 0) : 0
        }));

        return {
            statusCode: 200,
            message: "All restaurants found successfully",
            data: data
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

    async findFavoriteRestaurants(userId: number) {
        const favorites = await this.favoriteRestaurantRepository.find({
            where: { userId },
            relations: { restaurant: true },
            order: { createdAt: 'DESC' },
        });

        return {
            statusCode: 200,
            message: "Favorite restaurants fetched successfully",
            data: favorites.map((favorite) => favorite.restaurant).filter(Boolean),
        }
    }

    async findFavoriteRestaurantIds(userId: number) {
        const favorites = await this.favoriteRestaurantRepository.find({
            where: { userId },
            select: { restaurantId: true },
            order: { createdAt: 'DESC' },
        });

        return {
            statusCode: 200,
            message: "Favorite restaurant ids fetched successfully",
            data: favorites.map((favorite) => favorite.restaurantId),
        }
    }

    async checkFavoriteRestaurant(userId: number, restaurantId: number) {
        const favorite = await this.favoriteRestaurantRepository.findOne({
            where: { userId, restaurantId },
        });

        return {
            statusCode: 200,
            message: "Favorite restaurant status fetched successfully",
            data: { isFavorite: Boolean(favorite) },
        }
    }

    async addFavoriteRestaurant(userId: number, restaurantId: number) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new NotFoundException("Restaurant not found")
        }

        const existingFavorite = await this.favoriteRestaurantRepository.findOne({
            where: { userId, restaurantId },
            relations: { restaurant: true },
        });

        if (existingFavorite) {
            return {
                statusCode: 200,
                message: "Restaurant already in favorites",
                data: existingFavorite.restaurant ?? restaurant,
            }
        }

        const favorite = this.favoriteRestaurantRepository.create({ userId, restaurantId });
        await this.favoriteRestaurantRepository.save(favorite);

        return {
            statusCode: 201,
            message: "Restaurant added to favorites",
            data: restaurant,
        }
    }

    async removeFavoriteRestaurant(userId: number, restaurantId: number) {
        await this.favoriteRestaurantRepository.delete({ userId, restaurantId });

        return {
            statusCode: 200,
            message: "Restaurant removed from favorites",
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
