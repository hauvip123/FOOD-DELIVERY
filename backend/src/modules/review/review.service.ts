import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/entity/review.entiry';
import { In, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order } from 'src/entity/order.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    private readonly REVIEWABLE_ORDER_STATUS = 'completed';

    constructor(@InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
    ) { }

    async createReview(userId: number, reviewData: CreateReviewDto) {
        const order = await this.orderRepository.findOne({
            where: { id: reviewData.orderId }
        });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new ForbiddenException("You can't review this order")
        }
        if (order.orderStatus !== this.REVIEWABLE_ORDER_STATUS) {
            throw new BadRequestException('You can only review completed orders');
        }
        const exsitingReview = await this.reviewRepository.findOne({
            where: {
                orderId: reviewData.orderId,
            }
        })
        if (exsitingReview) {
            throw new BadRequestException('You have already reviewed this order');
        }
        const review = this.reviewRepository.create({
            userId,
            orderId: order.id,
            restaurantId: order.restaurantId,
            rating: reviewData.rating,
            comment: reviewData.comment,
        })
        const savedReview = await this.reviewRepository.save(review);
        await this.updateRestaurantRating(order.restaurantId);
        return {
            statusCode: 201,
            message: 'Review created successfully',
            data: savedReview,
        }
    }

    async findAll() {
        const reviews = await this.reviewRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });

        return {
            statusCode: 200,
            message: 'Get reviews successfully',
            data: reviews,
        };
    }

    async findByRestaurant(restaurantId: number, rating?: number) {
        const where: { restaurantId: number; rating?: number } = { restaurantId };
        if (rating) {
            where.rating = rating;
        }

        const reviews = await this.reviewRepository.find({
            where,
            order: {
                createdAt: 'DESC',
            },
        });

        return {
            statusCode: 200,
            message: 'Get restaurant reviews successfully',
            data: reviews,
        };
    }

    async findManagedReviews(ownerId: number, role: string, rating?: number, restaurantId?: number) {
        if (rating && (rating < 1 || rating > 5)) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        const restaurants = role === 'admin'
            ? await this.restaurantRepository.find()
            : await this.restaurantRepository.find({ where: { ownerId } });
        const allowedRestaurantIds = restaurants.map(restaurant => restaurant.id);

        if (allowedRestaurantIds.length === 0) {
            return {
                statusCode: 200,
                message: 'Get managed reviews successfully',
                data: [],
            };
        }

        let selectedRestaurantIds = allowedRestaurantIds;
        if (restaurantId) {
            if (!allowedRestaurantIds.includes(restaurantId)) {
                throw new ForbiddenException('You cannot view reviews for this restaurant');
            }
            selectedRestaurantIds = [restaurantId];
        }

        const where: { restaurantId: any; rating?: number } = {
            restaurantId: In(selectedRestaurantIds),
        };
        if (rating) {
            where.rating = rating;
        }

        const reviews = await this.reviewRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
        const restaurantById = new Map(restaurants.map(restaurant => [restaurant.id, restaurant]));

        return {
            statusCode: 200,
            message: 'Get managed reviews successfully',
            data: reviews.map(review => ({
                ...review,
                restaurantName: restaurantById.get(review.restaurantId)?.name ?? 'Nhà hàng',
            })),
        };
    }
    async findByOrder(orderId: number, userId: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId }
        });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new ForbiddenException("You can't view this order review");
        }

        const review = await this.reviewRepository.findOne({
            where: { orderId }
        });

        return {
            statusCode: 200,
            message: 'Get order review successfully',
            data: review,
        };
    }
    async findOne(id: number) {
        const review = await this.reviewRepository.findOne({
            where: { id }
        });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        return {
            statusCode: 200,
            message: 'Review found successfully',
            data: review,
        };
    }
    async update(
        id: number,
        userId: number,
        updateReviewDto: UpdateReviewDto,
    ) {
        const result = await this.findOne(id);
        const review = result.data;

        if (review.userId !== userId) {
            throw new ForbiddenException('You cannot update this review');
        }

        Object.assign(review, updateReviewDto);

        const updatedReview = await this.reviewRepository.save(review);

        await this.updateRestaurantRating(review.restaurantId);

        return {
            statusCode: 200,
            message: 'Update review successfully',
            data: updatedReview,
        };
    }

    async remove(id: number, userId: number) {
        const result = await this.findOne(id);
        const review = result.data;

        if (review.userId !== userId) {
            throw new ForbiddenException('You cannot delete this review');
        }

        await this.reviewRepository.remove(review);

        await this.updateRestaurantRating(review.restaurantId);

        return {
            statusCode: 200,
            message: 'Delete review successfully',
        };
    }

    private async updateRestaurantRating(restaurantId: number) {
        const reviews = await this.reviewRepository.find({
            where: { restaurantId },
        });

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            return;
        }

        if (reviews.length === 0) {
            restaurant.ratingAverage = 0;
        } else {
            const totalRating = reviews.reduce(
                (sum, review) => sum + review.rating,
                0,
            );

            restaurant.ratingAverage = Number(
                (totalRating / reviews.length).toFixed(1),
            );
        }

        await this.restaurantRepository.save(restaurant);
    }

}
