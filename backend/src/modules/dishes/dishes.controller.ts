import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) { }

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

  @Patch("/:id")
  async updateDish(@Param("id") id: string, @Body() updateDish: UpdateDishDto) {
    return this.dishesService.updateDish(Number(id), updateDish)
  }

  @Delete("/:id")
  async deleteDish(@Param("id") id: string) {
    return this.dishesService.deleteDish(Number(id))
  }
}
