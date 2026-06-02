import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get('/my-orders')
  findMyOrders(@Req() req) {
    return this.ordersService.findMyOrder(req.user.id);
  }

  @Get('/manage/overview')
  getManagedOverview(@Req() req) {
    return this.ordersService.getManagedOverview(req.user.id, req.user.role);
  }

  @Get('/manage/my-orders')
  findManagedOrders(@Req() req) {
    return this.ordersService.findManagedOrders(req.user.id, req.user.role);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateStatus(
      Number(id),
      updateOrderStatusDto.orderStatus,
      req.user,
    );
  }

  @Patch(':id/received')
  confirmReceived(@Req() req, @Param('id') id: string) {
    return this.ordersService.confirmReceived(Number(id), req.user.id);
  }

  @Patch(':id/cancel')
  cancelOrder(@Req() req, @Param('id') id: string) {
    return this.ordersService.cancelOrder(Number(id), req.user.id);
  }

  @Get(':id')
  getOrderDetail(@Param('id') id: string) {
    return this.ordersService.getOrderDetail(Number(id));
  }
}
