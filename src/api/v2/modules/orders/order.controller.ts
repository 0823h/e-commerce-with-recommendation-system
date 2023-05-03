import OrderService from './order.services';
import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';

class OrderController {
  private orderService: OrderService;
  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  createOrder = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.createOrder(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: order,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

  trainModel = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      await this.orderService.trainModel(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: null,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };
}

export default OrderController;
