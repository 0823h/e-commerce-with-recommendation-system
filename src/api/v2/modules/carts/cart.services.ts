import Cart, { ICart } from '@src/configs/database/models/cart.model';
import CartItem, { ICartItem } from '@src/configs/database/models/cart_item.model';
import Product, { IProduct } from '@src/configs/database/models/product.model';
import { Request as JWTRequest } from 'express-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { ModelStatic } from 'sequelize';
import User, { IUser } from '@src/configs/database/models/user.model';
import { HttpException } from '../../utils/http-exception';

class CartService {
  private readonly cartModel: ModelStatic<ICart>;
  private readonly cartItemModel: ModelStatic<ICartItem>;
  private readonly productModel: ModelStatic<IProduct>;
  private readonly userModel: ModelStatic<IUser>;

  constructor() {
    this.cartModel = Cart;
    this.cartItemModel = CartItem;
    this.productModel = Product;
    this.userModel = User;
  }

  addProductToCart = async (req: JWTRequest) => {
    try {
      const { user_id } = (<JwtPayload>req.auth).data;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      let cart = await this.cartModel.findOne({
        where: {
          user_id,
        },
      });

      if (!cart) {
        cart = await this.cartModel.create({
          user_id: user.id,
        });
        if (!cart) {
          throw new HttpException('Cart not found', 404);
        }
      }

      const { product_id, quantity } = req.body;
      const product = await this.productModel.findByPk(product_id);
      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      if (quantity > product.quantity) {
        throw new HttpException(`There are only ${product.quantity} products left`, 400);
      }

      let cartItem = await this.cartItemModel.findOne({
        where: {
          product_id,
          cart_id: cart.id,
        },
      });

      if (!cartItem) {
        cartItem = await this.cartItemModel.create({
          product_id,
          cart_id: cart.id,
          quantity,
          cart_price: product.price,
        });
        if (!cartItem) {
          throw new HttpException('Cannot add item to cart', 409);
        }
        return cartItem;
      }

      await cartItem.update({
        quantity: cartItem.quantity + quantity,
      });

      return cartItem;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getCartItems = async (req: JWTRequest) => {
    try {
      const { user_id } = (<JwtPayload>req.auth).data;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      let cart = await this.cartModel.findOne({
        where: {
          user_id,
        },
      });

      if (!cart) {
        cart = await this.cartModel.create({
          user_id: user.id,
        });
        if (!cart) {
          throw new HttpException('Cart not found', 404);
        }
      }

      const cartItems = await this.cartItemModel.findAll({
        where: {
          cart_id: cart.id,
        },
      });

      return cartItems;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default CartService;
