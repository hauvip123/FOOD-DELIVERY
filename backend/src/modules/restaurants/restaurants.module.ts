import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/entity/restaurant.entity';
import { FavoriteRestaurant } from 'src/entity/favorite-restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, FavoriteRestaurant])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService]
})
export class RestaurantsModule { }
