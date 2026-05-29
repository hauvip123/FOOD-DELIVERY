import { Module } from '@nestjs/common';
import { ReviewsService } from './review.service';
import { ReviewsController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/entity/review.entiry';
import { Order } from 'src/entity/order.entity';
import { Restaurant } from 'src/entity/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order, Restaurant])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewModule { }
