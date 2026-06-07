import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
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
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
        private readonly configService: ConfigService) { }

    async create(userId: number, createOrder: CreateOrderDto, ipAddr = '127.0.0.1') {
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
        const restaurant = await this.restaurantRepository.findOne({
            where: { id: cart.restaurantId }
        })
        if (!restaurant) {
            throw new NotFoundException("Restaurant not found")
        }
        const deliveryFee = Number(restaurant.deliveryFee || 0);
        const totalAmount = subtotal + deliveryFee;
        const paymentMethod = createOrder.paymentMethod === 'vnpay' ? 'vnpay' : (createOrder.paymentMethod || 'cash');
        const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'awaiting_payment';
        const vnpayTxnRef = paymentMethod === 'vnpay' ? this.createVnpayTxnRef() : null;

        const order = this.orderRepository.create({
            userId: userId,
            restaurantId: cart.restaurantId,
            phoneNumber: createOrder.phoneNumber,
            deliveryFee: deliveryFee,
            subtotal: subtotal,
            totalAmount: totalAmount,
            paymentStatus,
            paymentMethod,
            vnpayTxnRef,
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
        const paymentUrl = paymentMethod === 'vnpay' ? this.buildVnpayPaymentUrl(saveOrder, ipAddr) : undefined;
        return {
            statusCode: 200,
            message: "Order created successfully",
            data: paymentUrl ? { ...saveOrder, paymentUrl } : saveOrder
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
        order.paymentStatus = 'paid'
        await this.orderRepository.save(order)
        return {
            statusCode: 200,
            message: "Order received successfully",
            data: order
        }
    }


    async confirmPayment(orderId: number, userId: number) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        if (order.userId !== userId) {
            throw new ForbiddenException("You cannot confirm payment for this order")
        }
        if (order.paymentMethod === "vnpay") {
            throw new BadRequestException("VNPAY payments must be verified by VNPAY return data")
        }
        if (order.paymentMethod === "cash") {
            throw new BadRequestException("Cash orders cannot be paid online")
        }
        if (order.orderStatus === "cancelled") {
            throw new BadRequestException("Cancelled orders cannot be paid")
        }

        order.paymentStatus = "paid"
        await this.orderRepository.save(order)
        return {
            statusCode: 200,
            message: "Payment confirmed successfully",
            data: order
        }
    }

    async createVnpayPaymentUrl(orderId: number, userId: number, ipAddr = "127.0.0.1") {
        const order = await this.orderRepository.findOne({ where: { id: orderId } })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        if (order.userId !== userId) {
            throw new ForbiddenException("You cannot pay this order")
        }
        if (order.paymentMethod !== "vnpay") {
            throw new BadRequestException("This order is not a VNPAY order")
        }
        if (order.orderStatus === "cancelled") {
            throw new BadRequestException("Cancelled orders cannot be paid")
        }
        if (order.paymentStatus === "paid") {
            throw new BadRequestException("This order has already been paid")
        }

        order.vnpayTxnRef = this.createVnpayTxnRef()
        order.paymentStatus = "awaiting_payment"
        const savedOrder = await this.orderRepository.save(order)
        return {
            statusCode: 200,
            message: "VNPAY payment URL created successfully",
            data: {
                order: savedOrder,
                paymentUrl: this.buildVnpayPaymentUrl(savedOrder, ipAddr)
            }
        }
    }

    async handleVnpayReturn(query: Record<string, string | string[]>, userId: number) {
        const params = this.normalizeVnpayQuery(query)
        const secureHash = params.vnp_SecureHash
        if (!secureHash) {
            throw new BadRequestException("Missing VNPAY secure hash")
        }

        delete params.vnp_SecureHash
        delete params.vnp_SecureHashType

        const signed = this.signVnpayParams(params)
        if (signed.toLowerCase() !== secureHash.toLowerCase()) {
            throw new BadRequestException("Invalid VNPAY secure hash")
        }

        const order = await this.orderRepository.findOne({
            where: { vnpayTxnRef: params.vnp_TxnRef }
        })
        if (!order) {
            throw new NotFoundException("Order not found")
        }
        if (order.userId !== userId) {
            throw new ForbiddenException("You cannot verify this payment")
        }

        const expectedAmount = String(Math.round(Number(order.totalAmount) * 100))
        if (params.vnp_Amount !== expectedAmount) {
            throw new BadRequestException("VNPAY amount does not match this order")
        }

        const isSuccess = params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00"
        order.paymentStatus = isSuccess ? "paid" : "failed"
        order.vnpayTransactionNo = params.vnp_TransactionNo || order.vnpayTransactionNo
        await this.orderRepository.save(order)

        return {
            statusCode: 200,
            message: isSuccess ? "VNPAY payment verified successfully" : "VNPAY payment was not successful",
            data: {
                order,
                isSuccess,
                responseCode: params.vnp_ResponseCode,
                transactionStatus: params.vnp_TransactionStatus
            }
        }
    }

    private buildVnpayPaymentUrl(order: Order, ipAddr: string) {
        if (!order.vnpayTxnRef) {
            throw new BadRequestException("Missing VNPAY transaction reference")
        }

        const config = this.getVnpayConfig()
        const now = new Date()
        const expireDate = new Date(now.getTime() + 15 * 60 * 1000)
        const params: Record<string, string> = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: config.tmnCode,
            vnp_Amount: String(Math.round(Number(order.totalAmount) * 100)),
            vnp_CurrCode: "VND",
            vnp_TxnRef: order.vnpayTxnRef,
            vnp_OrderInfo: "Thanh toan don hang " + order.id,
            vnp_OrderType: "food",
            vnp_Locale: "vn",
            vnp_ReturnUrl: config.returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: this.formatVnpayDate(now),
            vnp_ExpireDate: this.formatVnpayDate(expireDate)
        }

        const secureHash = this.signVnpayParams(params)
        return config.paymentUrl + "?" + this.stringifyVnpayParams({ ...params, vnp_SecureHash: secureHash })
    }

    private getVnpayConfig() {
        const tmnCode = this.configService.get<string>("VNPAY_TMN_CODE")
        const hashSecret = this.configService.get<string>("VNPAY_HASH_SECRET")
        const paymentUrl = this.configService.get<string>("VNPAY_PAYMENT_URL") || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
        const frontendUrl = (this.configService.get<string>("FRONTEND_URL") || "http://localhost:3001").replace(/\/$/, "")
        const returnUrl = this.configService.get<string>("VNPAY_RETURN_URL") || frontendUrl + "/payment/vnpay-return"

        if (!tmnCode || !hashSecret) {
            throw new BadRequestException("Missing VNPAY_TMN_CODE or VNPAY_HASH_SECRET configuration")
        }

        return { tmnCode, hashSecret, paymentUrl, returnUrl }
    }

    private createVnpayTxnRef() {
        return "HD" + Date.now() + Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    }

    private signVnpayParams(params: Record<string, string>) {
        const config = this.getVnpayConfig()
        return createHmac("sha512", config.hashSecret)
            .update(this.stringifyVnpayParams(params))
            .digest("hex")
    }

    private stringifyVnpayParams(params: Record<string, string>) {
        return Object.keys(params)
            .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
            .sort()
            .map((key) => this.encodeVnpayValue(key) + "=" + this.encodeVnpayValue(params[key]))
            .join("&")
    }

    private encodeVnpayValue(value: string) {
        return encodeURIComponent(value).replace(/%20/g, "+")
    }

    private normalizeVnpayQuery(query: Record<string, string | string[]>) {
        return Object.fromEntries(
            Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
        ) as Record<string, string>
    }

    private formatVnpayDate(date: Date) {
        const vietnamDate = new Date(date.getTime() + 7 * 60 * 60 * 1000)
        const pad = (value: number) => value.toString().padStart(2, "0")
        return String(vietnamDate.getUTCFullYear())
            + pad(vietnamDate.getUTCMonth() + 1)
            + pad(vietnamDate.getUTCDate())
            + pad(vietnamDate.getUTCHours())
            + pad(vietnamDate.getUTCMinutes())
            + pad(vietnamDate.getUTCSeconds())
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
