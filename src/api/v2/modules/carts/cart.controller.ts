import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import CartService from './cart.services';

class CartController {
  private readonly cartService: CartService;
  constructor(cartService: CartService) {
    this.cartService = cartService;
  }

  addProductToCart = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const cart_item = await this.cartService.addProductToCart(req);
      return res.status(200).json({
        message: 'success',
        data: cart_item,
      });
    } catch (error) {
      return next(error);
    }
  };

  getCartItems = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const cart_items = await this.cartService.getCartItems(req);
      return res.status(200).json({
        message: 'success',
        data: cart_items,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default CartController;
