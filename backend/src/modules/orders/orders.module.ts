import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entity/order.entity';
import { OrderItem } from 'src/entity/order-item.entiry';
import { DeliveryAddress } from 'src/entity/delivery-address.entity';
import { Carts } from 'src/entity/carts.entity';
import { CartItems } from 'src/entity/cart-items.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, DeliveryAddress, Carts, CartItems])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
