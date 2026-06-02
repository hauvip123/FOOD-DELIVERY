import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItems } from 'src/entity/cart-items.entity';
import { Carts } from 'src/entity/carts.entity';
import { Repository } from 'typeorm';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ReplaceCartItemDto } from './dto/replace-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
    @InjectRepository(CartItems)
    private readonly cartItemsRepository: Repository<CartItems>,
  ) {}

  async addItemToCart(userId: number, cartItem: AddCartDto) {
    let cart = await this.cartsRepository.findOne({ where: { userId } });

    if (cart && cart.restaurantId !== cartItem.restaurantId) {
      throw new BadRequestException(
        'Cart already contains items from another restaurant',
      );
    }

    if (!cart) {
      cart = this.cartsRepository.create({
        userId,
        restaurantId: cartItem.restaurantId,
        totalAmount: 0,
      });
      cart = await this.cartsRepository.save(cart);
    }

    const existingItem = await this.cartItemsRepository.findOne({
      where: {
        cartId: cart.id,
        dishId: cartItem.dishId,
      },
    });

    if (existingItem) {
      const oldSubtotal = Number(existingItem.price) * Number(existingItem.quantity);
      existingItem.quantity += cartItem.quantity;
      existingItem.price = cartItem.price;
      existingItem.name = cartItem.name;
      if (cartItem.note !== undefined) {
        existingItem.note = cartItem.note;
      }
      await this.cartItemsRepository.save(existingItem);

      const newSubtotal = Number(existingItem.price) * Number(existingItem.quantity);
      cart.totalAmount = this.normalizeTotal(Number(cart.totalAmount) + newSubtotal - oldSubtotal);
    } else {
      const newCartItem = this.cartItemsRepository.create({
        cartId: cart.id,
        dishId: cartItem.dishId,
        quantity: cartItem.quantity,
        name: cartItem.name,
        price: cartItem.price,
        note: cartItem.note,
      });
      await this.cartItemsRepository.save(newCartItem);

      cart.totalAmount = this.normalizeTotal(
        Number(cart.totalAmount) + Number(cartItem.price) * Number(cartItem.quantity),
      );
    }

    cart = await this.cartsRepository.save(cart);

    return {
      statusCode: 201,
      message: 'Item added to cart successfully',
      data: await this.buildCartResponseFromCart(cart),
    };
  }

  async getCartByUser(userId: number) {
    return {
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: await this.buildCartResponse(userId),
    };
  }

  async replaceCart(userId: number, items: ReplaceCartItemDto[]) {
    if (items.length === 0) {
      return this.clearCart(userId);
    }

    const restaurantId = items[0].restaurantId;
    const hasDifferentRestaurant = items.some((item) => item.restaurantId !== restaurantId);
    if (hasDifferentRestaurant) {
      throw new BadRequestException('Cart items must belong to one restaurant');
    }

    let cart = await this.cartsRepository.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartsRepository.create({
        userId,
        restaurantId,
        totalAmount: 0,
      });
      cart = await this.cartsRepository.save(cart);
    } else {
      cart.restaurantId = restaurantId;
      await this.cartItemsRepository.delete({ cartId: cart.id });
    }

    const activeCart = cart;
    const cartItems = items.map((item) => this.cartItemsRepository.create({
      cartId: activeCart.id,
      dishId: item.dishId,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      note: item.note,
    }));

    const savedItems = await this.cartItemsRepository.save(cartItems);
    activeCart.totalAmount = this.normalizeTotal(
      savedItems.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0),
    );
    const updatedCart = await this.cartsRepository.save(activeCart);

    return {
      statusCode: 200,
      message: 'Cart replaced successfully',
      data: this.formatCartResponse(updatedCart, savedItems),
    };
  }

  async updateCartItem(userId: number, cartItemId: number, cartItem: UpdateCartDto) {
    const { cart, cartItem: cartItemExist } = await this.findCartItemForUser(userId, cartItemId);

    if (cartItem.quantity === 0) {
      return this.deleteCartItem(userId, cartItemExist.id);
    }

    const oldSubtotal = Number(cartItemExist.price) * Number(cartItemExist.quantity);

    if (cartItem.price !== undefined) {
      cartItemExist.price = cartItem.price;
    }
    if (cartItem.quantity !== undefined) {
      cartItemExist.quantity = cartItem.quantity;
    }
    if (cartItem.note !== undefined) {
      cartItemExist.note = cartItem.note;
    }

    await this.cartItemsRepository.save(cartItemExist);

    const newSubtotal = Number(cartItemExist.price) * Number(cartItemExist.quantity);
    cart.totalAmount = this.normalizeTotal(Number(cart.totalAmount) + newSubtotal - oldSubtotal);
    const updatedCart = await this.cartsRepository.save(cart);

    return {
      statusCode: 200,
      message: 'Cart item updated successfully',
      data: await this.buildCartResponseFromCart(updatedCart),
    };
  }

  async deleteCartItem(userId: number, cartItemId: number) {
    const { cart, cartItem } = await this.findCartItemForUser(userId, cartItemId);
    const removedSubtotal = Number(cartItem.price) * Number(cartItem.quantity);

    await this.cartItemsRepository.remove(cartItem);

    cart.totalAmount = this.normalizeTotal(Number(cart.totalAmount) - removedSubtotal);
    const remainingItems = await this.cartItemsRepository.find({
      where: { cartId: cart.id },
      order: { id: 'ASC' },
    });

    if (remainingItems.length === 0) {
      await this.cartsRepository.remove(cart);
      return {
        statusCode: 200,
        message: 'Cart item deleted successfully',
        data: this.emptyCartResponse(),
      };
    }

    const updatedCart = await this.cartsRepository.save(cart);

    return {
      statusCode: 200,
      message: 'Cart item deleted successfully',
      data: this.formatCartResponse(updatedCart, remainingItems),
    };
  }

  async clearCart(userId: number) {
    const cart = await this.cartsRepository.findOne({ where: { userId } });
    if (cart) {
      await this.cartItemsRepository.delete({ cartId: cart.id });
      await this.cartsRepository.remove(cart);
    }

    return {
      statusCode: 200,
      message: 'Cart cleared successfully',
      data: this.emptyCartResponse(),
    };
  }

  private async buildCartResponse(userId: number) {
    const cart = await this.cartsRepository.findOne({ where: { userId } });
    if (!cart) {
      return this.emptyCartResponse();
    }

    return this.buildCartResponseFromCart(cart);
  }

  private async buildCartResponseFromCart(cart: Carts) {
    const cartItem = await this.cartItemsRepository.find({
      where: { cartId: cart.id },
      order: { id: 'ASC' },
    });

    return this.formatCartResponse(cart, cartItem);
  }

  private formatCartResponse(cart: Carts, cartItem: CartItems[]) {
    return {
      cart,
      cartItem,
    };
  }

  private emptyCartResponse() {
    return {
      cart: null,
      cartItem: [],
    };
  }

  private async findCartItemForUser(userId: number, cartItemId: number) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: cartItemId },
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const cart = await this.cartsRepository.findOne({
      where: { id: cartItem.cartId },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    if (cart.userId !== userId) {
      throw new ForbiddenException('You cannot access this cart item');
    }

    return { cart, cartItem };
  }

  private normalizeTotal(total: number) {
    return Math.max(0, Number(total.toFixed(2)));
  }
}
