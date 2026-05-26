import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItems } from 'src/entity/cart-items.entity';
import { Carts } from 'src/entity/carts.entity';
import { Repository } from 'typeorm';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
    @InjectRepository(CartItems)
    private readonly cartItemsRepository: Repository<CartItems>,
  ) {}

  async addItemToCart(cartItem: AddCartDto) {
    let cart = await this.cartsRepository.findOne({
      where: {
        userId: cartItem.userId,
      },
    });

    if (cart && cart.restaurantId !== cartItem.restaurantId) {
      throw new BadRequestException(
        'Cart already contains items from another restaurant',
      );
    }

    if (!cart) {
      cart = this.cartsRepository.create({
        userId: cartItem.userId,
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
      existingItem.quantity += cartItem.quantity;
      existingItem.price = cartItem.price;
      existingItem.name = cartItem.name;
      if (cartItem.note !== undefined) {
        existingItem.note = cartItem.note;
      }
      await this.cartItemsRepository.save(existingItem);
    } else {
      const cartItems = this.cartItemsRepository.create({
        cartId: cart.id,
        dishId: cartItem.dishId,
        quantity: cartItem.quantity,
        name: cartItem.name,
        price: cartItem.price,
        note: cartItem.note,
      });
      await this.cartItemsRepository.save(cartItems);
    }

    await this.updateCartTotal(cart.id);

    return {
      statusCode: 201,
      message: 'Item added to cart successfully',
    };
  }
  async getCartByUser(userId: number) {
    const cart = await this.cartsRepository.findOne({
      where: {
        userId: userId,
      },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const cartItem = await this.cartItemsRepository.find({
      where: {
        cartId: cart.id,
      },
    });
    return {
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: {
        cart,
        cartItem,
      },
    };
  }

  async updateCartItem(cartItemId: number, cartItem: UpdateCartDto) {
    const cartItemExist = await this.cartItemsRepository.findOne({
      where: {
        id: cartItemId,
      },
    });
    if (!cartItemExist) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.quantity === 0) {
      return this.deleteCartItem(cartItemExist.id);
    }

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
    await this.updateCartTotal(cartItemExist.cartId);

    return {
      statusCode: 200,
      message: 'Cart item updated successfully',
    };
  }

  async deleteCartItem(cartItemId: number) {
    const cartItemExist = await this.cartItemsRepository.findOne({
      where: {
        id: cartItemId,
      },
    });
    if (!cartItemExist) {
      throw new NotFoundException('Cart item not found');
    }
    const cartId = cartItemExist.cartId;
    await this.cartItemsRepository.remove(cartItemExist);
    await this.updateCartTotal(cartId);

    return {
      statusCode: 200,
      message: 'Cart item deleted successfully',
    };
  }

  private async updateCartTotal(cartId: number) {
    const cart = await this.cartsRepository.findOne({
      where: {
        id: cartId,
      },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItems = await this.cartItemsRepository.find({
      where: {
        cartId,
      },
    });

    cart.totalAmount = cartItems.reduce((total, item) => {
      return total + Number(item.price) * Number(item.quantity);
    }, 0);

    await this.cartsRepository.save(cart);
  }
}
