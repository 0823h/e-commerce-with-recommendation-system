import { Router } from 'express';
import { schema, validate } from 'express-validation';
import CartService from './cart.services';
import CartController from './cart.controller';
import { auth } from '../../middlewares/auth.middleware';
import { addProductToCartBody } from './cart.validate';

const cartService = new CartService();
const cartController = new CartController(cartService);

const CartRoute = Router();

CartRoute.post('/', auth, validate(addProductToCartBody as schema), cartController.addProductToCart);
CartRoute.get('/', auth, cartController.getCartItems);

export default CartRoute;
