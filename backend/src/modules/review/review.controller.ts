import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post()
  create(@Req() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('restaurant', 'admin')
  @Get('manage/my-reviews')
  findManagedReviews(
    @Req() req,
    @Query('rating') rating?: string,
    @Query('restaurantId') restaurantId?: string,
  ) {
    return this.reviewsService.findManagedReviews(
      req.user.id,
      req.user.role,
      rating ? Number(rating) : undefined,
      restaurantId ? Number(restaurantId) : undefined,
    );
  }

  @Get('restaurant/:restaurantId')
  findByRestaurant(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query('rating') rating?: string,
  ) {
    return this.reviewsService.findByRestaurant(restaurantId, rating ? Number(rating) : undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number, @Req() req) {
    return this.reviewsService.findByOrder(orderId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(
      id,
      req.user.id,
      updateReviewDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reviewsService.remove(id, req.user.id);
  }
}