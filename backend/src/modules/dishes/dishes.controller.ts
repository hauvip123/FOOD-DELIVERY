import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant')
  @Post()
  async createDishes(@Body() createDish: CreateDishDto) {
    return this.dishesService.createDishes(createDish);
  }

  @Get()
  async getAllDishes() {
    return this.dishesService.getAllDishes();
  }

  @Get("/:id")
  async getDishById(@Param("id") id: string) {
    return this.dishesService.getDishById(Number(id));
  }

  @Get("/restaurant/:id")
  async getDishByRestaurantId(@Param("id") id: string) {
    return this.dishesService.getDishByRestaurantId(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant')
  @Patch("/:id")
  async updateDish(@Param("id") id: string, @Body() updateDish: UpdateDishDto) {
    return this.dishesService.updateDish(Number(id), updateDish)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'restaurant')
  @Delete("/:id")
  async deleteDish(@Param("id") id: string) {
    return this.dishesService.deleteDish(Number(id))
  }
}
