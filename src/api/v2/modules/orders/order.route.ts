import { Router } from 'express';
import { schema, validate } from 'express-validation';
import OrderService from './order.services';
import OrderController from './order.controller';

const orderService = new OrderService();
const orderController = new OrderController(orderService);

const OrderRoute = Router();

OrderRoute.post('/', orderController.createOrder);
OrderRoute.get('/train', orderController.trainModel);

export default OrderRoute;
