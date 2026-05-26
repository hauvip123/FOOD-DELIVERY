import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carts } from 'src/entity/carts.entity';
import { CartItems } from 'src/entity/cart-items.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carts, CartItems])],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule { }
