import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from 'src/entity/categories.entity';
import { Restaurant } from 'src/entity/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categories, Restaurant])],
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule { }
