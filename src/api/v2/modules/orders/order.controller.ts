import OrderService from './order.services';
import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';

class OrderController {
  private orderService: OrderService;
  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  adminCreateOrder = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.adminCreateOrder(req);
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
      const is_fraud = await this.orderService.trainModel(req);
      if (is_fraud === true) {
        return res.status(200).json({
          status: 200,
          message: 'success',
          data: {
            is_fraud,
          },
        });
      }
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          is_fraud,
        },
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

  vnpay = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const vnpayurl = await this.orderService.vnpay(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: vnpayurl,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

  getUniqueId = (req: JWTRequest, res: Response, next: NextFunction) => {
    const id = this.orderService.getUniqueId();
    return res.status(200).json({
      id,
    });
  };

  getOrders = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await this.orderService.getOrders(req);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = orders.rows.length;
      const total_pages = Math.ceil(orders.count / limit);
      const total_count = orders.count;

      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          records: orders.rows,
          metadata: {
            page,
            limit,
            page_count,
            total_pages,
            total_count,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  userCreateOrder = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.userCreateOrder(req);
      console.log({ order })
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: order,
      });
    }
    catch (error) {
      return next(error);
    }
  };

  getOrderProducts = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await this.orderService.getOrderProducts(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: orders,
      });
    } catch (error) {
      return next(error);
    }

  }
}

export default OrderController;
