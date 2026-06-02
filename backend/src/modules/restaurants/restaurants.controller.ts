import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FindRestaurantsQueryDto } from './dto/find-restaurants-query.dto';


@Controller('restaurants')
export class RestaurantsController {
    constructor(private readonly restaurantService: RestaurantsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'restaurant')
    @Post()
    createRestaurant(
        @Body() createRestaurantDto: CreateRestaurantDto,
        @Req() req,
    ) {
        const ownerId = req.user.id;
        return this.restaurantService.createRestaurant(createRestaurantDto, ownerId);
    }

    @Get()
    findAll(@Query() query: FindRestaurantsQueryDto) {
        return this.restaurantService.findAll(query);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'restaurant')
    @Get('my-restaurants')
    findMyRestaurants(@Req() req) {
        return this.restaurantService.findByOwner(req.user.id);
    }

    @Get('/:id')
    findById(@Param('id') id: string) {
        return this.restaurantService.findByid(Number(id));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'restaurant')
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'restaurant')
    @Delete('/:id')
    remove(@Param('id') id: string) {
        return this.restaurantService.deleteRestaurant(Number(id));
    }

}
