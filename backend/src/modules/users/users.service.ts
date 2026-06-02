import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Restaurant)
        private readonly restaurantRepository: Repository<Restaurant>,
    ) { }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async updateToken(userId: number, token: string | null) {
        await this.userRepository.update(userId, { refreshToken: token });
    }

    async findByRefreshToken(refreshToken: string) {
        return this.userRepository.findOne({ where: { refreshToken } });
    }

    async updateResetPasswordToken(userId: number, token: string | null, expires: Date | null) {
        await this.userRepository.update(userId, {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });
    }

    async findByResetPasswordToken(resetPasswordToken: string) {
        return this.userRepository.findOne({ where: { resetPasswordToken } });
    }

    async updatePassword(userId: number, password: string) {
        await this.userRepository.update(userId, {
            password,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            refreshToken: null,
        });
    }

    async getAdminOverview() {
        const [users, restaurants] = await Promise.all([
            this.userRepository.find({ order: { createdAt: 'DESC' } }),
            this.restaurantRepository.find({ order: { createdAt: 'DESC' } }),
        ]);

        const roleOrder = ['customer', 'restaurant', 'admin'];
        const statusOrder = ['active', 'inactive', 'blocked'];
        const cityCounts = new Map<string, number>();
        const cuisineCounts = new Map<string, number>();

        restaurants.forEach((restaurant) => {
            cityCounts.set(restaurant.city, (cityCounts.get(restaurant.city) ?? 0) + 1);
            cuisineCounts.set(restaurant.cuisine, (cuisineCounts.get(restaurant.cuisine) ?? 0) + 1);
        });

        const topCities = Array.from(cityCounts.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topCuisines = Array.from(cuisineCounts.entries())
            .map(([cuisine, count]) => ({ cuisine, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            statusCode: 200,
            message: 'Admin overview fetched successfully',
            data: {
                summary: {
                    totalUsers: users.length,
                    customerCount: users.filter(user => user.role === 'customer').length,
                    restaurantOwnerCount: users.filter(user => user.role === 'restaurant').length,
                    adminCount: users.filter(user => user.role === 'admin').length,
                    activeUserCount: users.filter(user => user.status === 'active').length,
                    totalRestaurants: restaurants.length,
                    openRestaurantCount: restaurants.filter(restaurant => restaurant.isOpen).length,
                    closedRestaurantCount: restaurants.filter(restaurant => !restaurant.isOpen).length,
                    averageRestaurantRating: restaurants.length > 0
                        ? Number((restaurants.reduce((sum, restaurant) => sum + Number(restaurant.ratingAverage || 0), 0) / restaurants.length).toFixed(1))
                        : 0,
                },
                usersByRole: roleOrder.map(role => ({
                    role,
                    count: users.filter(user => user.role === role).length,
                })).filter(item => item.count > 0),
                usersByStatus: statusOrder.map(status => ({
                    status,
                    count: users.filter(user => user.status === status).length,
                })).filter(item => item.count > 0),
                restaurantsByStatus: [
                    { status: 'open', label: 'Đang mở', count: restaurants.filter(restaurant => restaurant.isOpen).length },
                    { status: 'closed', label: 'Tạm nghỉ', count: restaurants.filter(restaurant => !restaurant.isOpen).length },
                ],
                topCities,
                topCuisines,
                recentUsers: users.slice(0, 6).map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    createdAt: user.createdAt,
                })),
                recentRestaurants: restaurants.slice(0, 6).map(restaurant => ({
                    id: restaurant.id,
                    ownerId: restaurant.ownerId,
                    name: restaurant.name,
                    city: restaurant.city,
                    cuisine: restaurant.cuisine,
                    isOpen: restaurant.isOpen,
                    ratingAverage: restaurant.ratingAverage,
                    createdAt: restaurant.createdAt,
                })),
            },
        };
    }

}