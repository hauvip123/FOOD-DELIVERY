import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ReplaceCartDto } from './dto/replace-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) { }

  @Post('items')
  addItemToCart(@Req() req, @Body() cartItem: AddCartDto) {
    return this.cartsService.addItemToCart(req.user.id, cartItem);
  }

  @Get()
  getMyCart(@Req() req) {
    return this.cartsService.getCartByUser(req.user.id);
  }

  @Get('users/:userId')
  getCartByUser(@Req() req, @Param('userId', ParseIntPipe) userId: number) {
    return this.cartsService.getCartByUser(req.user.id === userId ? userId : req.user.id);
  }

  @Put()
  replaceCart(@Req() req, @Body() replaceCartDto: ReplaceCartDto) {
    return this.cartsService.replaceCart(req.user.id, replaceCartDto.items);
  }

  @Patch('items/:cartItemId')
  updateCartItem(
    @Req() req,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() cartItem: UpdateCartDto,
  ) {
    return this.cartsService.updateCartItem(req.user.id, cartItemId, cartItem);
  }

  @Delete()
  clearCart(@Req() req) {
    return this.cartsService.clearCart(req.user.id);
  }

  @Delete('items/:cartItemId')
  deleteCartItem(@Req() req, @Param('cartItemId', ParseIntPipe) cartItemId: number) {
    return this.cartsService.deleteCartItem(req.user.id, cartItemId);
  }
}
