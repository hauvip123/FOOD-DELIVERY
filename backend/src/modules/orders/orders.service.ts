import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItems } from 'src/entity/cart-items.entity';
import { Carts } from 'src/entity/carts.entity';
import { DeliveryAddress } from 'src/entity/delivery-address.entity';
import { OrderItem } from 'src/entity/order-item.entiry';
import { Order } from 'src/entity/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(@InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
        @InjectRepository(DeliveryAddress) private readonly deliveryAddressRepository: Repository<DeliveryAddress>,
        @InjectRepository(Carts) private readonly cartsRepository: Repository<Carts>,
        @InjectRepository(CartItems) private readonly cartItemsRepostitory: Repository<CartItems>) { }

    async create(userId: number, createOrder: CreateOrderDto) {
        const cart = await this.cartsRepository.findOne({
            where: { userId }
        })
        if (!cart) {
            throw new NotFoundException("Cart not found")
        }
        const cartItems = await this.cartItemsRepostitory.find({
            where: {
                cartId: cart.id
            }
        })
        if (cartItems.length === 0) {
            throw new BadRequestException("Cart is empty")
        }
        const subtotal = cartItems.reduce((sum, items) => sum + items.price * items.quantity, 0)
        const deliveryFee = createOrder.deliveryFee || 0;
        const totalAmount = subtotal + deliveryFee;

        const order = this.orderRepository.create({
            userId: userId,
            restaurantId: cart.restaurantId,
            phoneNumber: createOrder.phoneNumber,
            deliveryFee: deliveryFee,
            subtotal: subtotal,
            totalAmount: totalAmount,
            paymentStatus: 'pending',
            paymentMethod: createOrder.paymentMethod,
            orderStatus: 'pending',
        })
        const saveOrder = await this.orderRepository.save(order)

        const orderItem = cartItems.map(item => this.orderItemRepository.create({
            orderId: saveOrder.id,
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            note: item.note
        }))
        await this.orderItemRepository.save(orderItem)

        const deliveryAddress = this.deliveryAddressRepository.create({
            orderId: saveOrder.id,
            street: createOrder.street,
            city: createOrder.city,
            note: createOrder.note,
        })
        await this.deliveryAddressRepository.save(deliveryAddress)

        await this.cartItemsRepostitory.delete({
            cartId: cart.id
        })
        await this.cartsRepository.delete({
            id: cart.id
        })
        return {
            statusCode: 200,
            message: "Order created successfully",
            data: saveOrder
        }

    }

    async findMyOrder(userId: number) {
        const orders = await this.orderRepository.find({
            where: {
                userId
            },
            order: {
                createdAt: "DESC"
            }
        })
        return {
            statusCode: 200,
            message: "My orders fetched successfully",
            data: orders
        }
    }

    async getOrderDetail(orderId: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId }
        })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        const orderItem = await this.orderItemRepository.find({
            where: { orderId }
        })
        const deliveryAddress = await this.deliveryAddressRepository.findOne({
            where: { orderId }
        })
        return {
            statusCode: 200,
            message: "Order detail fetched successfully",
            data: {
                order,
                orderItem,
                deliveryAddress
            }
        }
    }
    async updateStatus(orderId: number, status: string) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId }
        })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        order.orderStatus = status
        await this.orderRepository.save(order)
        return {
            statusCode: 200,
            message: "Order status updated successfully",
            data: order
        }
    }
    async cancelOrder(orderId: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId }
        })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        order.orderStatus = "cancelled"
        await this.orderRepository.save(order)
        return {
            statusCode: 200,
            message: "Order cancelled successfully",
            data: order
        }
    }
}
