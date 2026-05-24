import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';


@Controller('restaurants')
export class RestaurantsController {
    constructor(private readonly restaurantService: RestaurantsService) { }

    @Post()
    createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto) {
        return this.restaurantService.createRestaurant(createRestaurantDto);
    }

    @Get()
    findAll() {
        return this.restaurantService.findAll();
    }

    @Get('/:id')
    findById(@Param('id') id: string) {
        return this.restaurantService.findByid(Number(id));
    }

    @Patch('/:id')
    updateRestaurant(
        @Param('id') id: string,
        @Body() updateRestaurantDto: UpdateRestaurantDto,
    ) {
        return this.restaurantService.updateRestaurant(
            Number(id),
            updateRestaurantDto,
        );
    }

    @Delete('/:id')
    remove(@Param('id') id: string) {
        return this.restaurantService.deleteRestaurant(Number(id));
    }

}
