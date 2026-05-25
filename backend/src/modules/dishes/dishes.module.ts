import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from 'src/entity/categories.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { Dish } from 'src/entity/dish.entiry';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, Categories, Restaurant])],
  controllers: [DishesController],
  providers: [DishesService],
})
export class DishesModule { }
