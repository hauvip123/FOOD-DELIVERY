import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('items')
  addItemToCart(@Body() cartItem: AddCartDto) {
    return this.cartsService.addItemToCart(cartItem);
  }

  @Get('users/:userId')
  getCartByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartsService.getCartByUser(userId);
  }

  @Patch('items/:cartItemId')
  updateCartItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() cartItem: UpdateCartDto,
  ) {
    return this.cartsService.updateCartItem(cartItemId, cartItem);
  }

  @Delete('items/:cartItemId')
  deleteCartItem(@Param('cartItemId', ParseIntPipe) cartItemId: number) {
    return this.cartsService.deleteCartItem(cartItemId);
  }
}
