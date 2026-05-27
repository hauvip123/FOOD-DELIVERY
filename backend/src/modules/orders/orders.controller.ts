import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    const userId = 1;

    return this.ordersService.create(
      userId,
      createOrderDto,
    );
  }

  @Get('/my-orders')
  findMyOrders() {

    const userId = 1;

    return this.ordersService.findMyOrder(userId);
  }

  @Get(':id')
  getOrderDetail(@Param('id') id: string) {
    return this.ordersService.getOrderDetail(Number(id));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    updateOrderStatusDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateStatus(
      Number(id),
      updateOrderStatusDto.orderStatus,
    );
  }

  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(
      Number(id),
    );
  }
}
