import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItems } from 'src/entity/cart-items.entity';
import { Carts } from 'src/entity/carts.entity';
import { DeliveryAddress } from 'src/entity/delivery-address.entity';
import { OrderItem } from 'src/entity/order-item.entiry';
import { Order } from 'src/entity/order.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(@InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
        @InjectRepository(DeliveryAddress) private readonly deliveryAddressRepository: Repository<DeliveryAddress>,
        @InjectRepository(Carts) private readonly cartsRepository: Repository<Carts>,
        @InjectRepository(CartItems) private readonly cartItemsRepostitory: Repository<CartItems>,
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>) { }

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

    async findManagedOrders(ownerId: number, role: string) {
        const restaurants = role === 'admin'
            ? await this.restaurantRepository.find()
            : await this.restaurantRepository.find({ where: { ownerId } })

        const restaurantIds = restaurants.map(restaurant => restaurant.id)
        if (restaurantIds.length === 0) {
            return {
                statusCode: 200,
                message: "Managed orders fetched successfully",
                data: []
            }
        }

        const orders = await this.orderRepository.find({
            where: { restaurantId: In(restaurantIds) },
            order: { createdAt: "DESC" }
        })

        return {
            statusCode: 200,
            message: "Managed orders fetched successfully",
            data: orders
        }
    }

    async getManagedOverview(ownerId: number, role: string) {
        const restaurants = role === 'admin'
            ? await this.restaurantRepository.find()
            : await this.restaurantRepository.find({ where: { ownerId } })

        const restaurantIds = restaurants.map(restaurant => restaurant.id)
        const restaurantById = new Map(restaurants.map(restaurant => [restaurant.id, restaurant]))

        if (restaurantIds.length === 0) {
            return {
                statusCode: 200,
                message: "Managed overview fetched successfully",
                data: {
                    summary: {
                        restaurantCount: 0,
                        openRestaurantCount: 0,
                        totalOrders: 0,
                        pendingOrders: 0,
                        activeOrders: 0,
                        completedOrders: 0,
                        cancelledOrders: 0,
                        totalRevenue: 0,
                        todayRevenue: 0,
                        averageOrderValue: 0,
                    },
                    revenueSeries: [],
                    statusBreakdown: [],
                    topRestaurants: [],
                    recentOrders: [],
                }
            }
        }

        const orders = await this.orderRepository.find({
            where: { restaurantId: In(restaurantIds) },
            order: { createdAt: "DESC" }
        })

        const completedOrders = orders.filter(order => order.orderStatus === 'completed')
        const pendingOrders = orders.filter(order => order.orderStatus === 'pending')
        const activeOrders = orders.filter(order => !['completed', 'cancelled'].includes(order.orderStatus))
        const cancelledOrders = orders.filter(order => order.orderStatus === 'cancelled')
        const todayKey = new Date().toISOString().slice(0, 10)
        const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
        const todayRevenue = completedOrders
            .filter(order => new Date(order.updatedAt).toISOString().slice(0, 10) === todayKey)
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)

        const revenueBuckets = new Map<string, { date: string; revenue: number; orders: number }>()
        for (let offset = 6; offset >= 0; offset--) {
            const date = new Date()
            date.setDate(date.getDate() - offset)
            const key = date.toISOString().slice(0, 10)
            revenueBuckets.set(key, { date: key, revenue: 0, orders: 0 })
        }

        completedOrders.forEach(order => {
            const key = new Date(order.updatedAt).toISOString().slice(0, 10)
            const bucket = revenueBuckets.get(key)
            if (bucket) {
                bucket.revenue += Number(order.totalAmount || 0)
                bucket.orders += 1
            }
        })

        const statusLabels = new Map([
            ['pending', 'Chờ xác nhận'],
            ['confirmed', 'Đã xác nhận'],
            ['preparing', 'Đang chuẩn bị'],
            ['delivering', 'Đang giao'],
            ['completed', 'Đã nhận hàng'],
            ['cancelled', 'Đã hủy'],
        ])
        const statusOrder = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled']
        const statusBreakdown = statusOrder.map(status => ({
            status,
            label: statusLabels.get(status),
            count: orders.filter(order => order.orderStatus === status).length,
        })).filter(item => item.count > 0)

        const topRestaurants = restaurants.map(restaurant => {
            const restaurantOrders = orders.filter(order => order.restaurantId === restaurant.id)
            const restaurantCompletedOrders = restaurantOrders.filter(order => order.orderStatus === 'completed')
            const revenue = restaurantCompletedOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
            return {
                id: restaurant.id,
                name: restaurant.name,
                isOpen: restaurant.isOpen,
                ratingAverage: restaurant.ratingAverage,
                orderCount: restaurantOrders.length,
                revenue,
            }
        }).sort((a, b) => b.revenue - a.revenue || b.orderCount - a.orderCount).slice(0, 5)

        const recentOrders = orders.slice(0, 6).map(order => ({
            id: order.id,
            restaurantId: order.restaurantId,
            restaurantName: restaurantById.get(order.restaurantId)?.name ?? 'Nhà hàng',
            phoneNumber: order.phoneNumber,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
        }))

        return {
            statusCode: 200,
            message: "Managed overview fetched successfully",
            data: {
                summary: {
                    restaurantCount: restaurants.length,
                    openRestaurantCount: restaurants.filter(restaurant => restaurant.isOpen).length,
                    totalOrders: orders.length,
                    pendingOrders: pendingOrders.length,
                    activeOrders: activeOrders.length,
                    completedOrders: completedOrders.length,
                    cancelledOrders: cancelledOrders.length,
                    totalRevenue,
                    todayRevenue,
                    averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
                },
                revenueSeries: Array.from(revenueBuckets.values()),
                statusBreakdown,
                topRestaurants,
                recentOrders,
            }
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
    async updateStatus(orderId: number, status: string, user?: { id: number; role: string }) {
        const allowedManagerStatuses = ['confirmed', 'preparing', 'delivering']
        if (!allowedManagerStatuses.includes(status)) {
            throw new BadRequestException("Manager can only confirm, prepare, or deliver orders")
        }

        const order = await this.orderRepository.findOne({
            where: { id: orderId }
        })
        if (!order) {
            throw new NotFoundException("Order not found")
        }

        if (user && user.role !== 'admin') {
            const restaurant = await this.restaurantRepository.findOne({
                where: { id: order.restaurantId }
            })
            if (!restaurant || restaurant.ownerId !== user.id) {
                throw new ForbiddenException("You cannot update this order")
            }
        }

        order.orderStatus = status
        await this.orderRepository.save(order)
        return {
            statusCode: 200,
            message: "Order status updated successfully",
            data: order
        }
    }

    async confirmReceived(orderId: number, userId: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId }
        })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        if (order.userId !== userId) {
            throw new ForbiddenException("You cannot confirm this order")
        }
        if (order.orderStatus !== 'delivering') {
            throw new BadRequestException("Only delivering orders can be confirmed as received")
        }

        order.orderStatus = "completed"
        await this.orderRepository.save(order)
        return {
            statusCode: 200,
            message: "Order received successfully",
            data: order
        }
    }

    async cancelOrder(orderId: number, userId: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId }
        })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        if (order.userId !== userId) {
            throw new ForbiddenException("You cannot cancel this order")
        }
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            throw new BadRequestException("Only pending or confirmed orders can be cancelled")
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
