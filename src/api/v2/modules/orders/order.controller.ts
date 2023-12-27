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
      console.log(req.body)
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
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          data: is_fraud,
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

  changeOrderStatus = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.changeOrderStatus(req);
      return res.status(200).json({
        status: 204,
        message: 'success',
        data: order
      })
    } catch (error) {
      return next(error);
    }
  }

  assignToShipper = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.assignToShipper(req);
      return res.status(204).json({
        status: 204,
        message: 'success',
        data: order,
      });
    } catch (error) {
      return next(error);
    }
  }

  getStatistics = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const statistics = await this.orderService.getStatistics(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          ...statistics,
          start_date: req.query.start_date,
          end_date: req.query.end_date
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  guestCreateOrder = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.guestCreateOrder(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: order,
      });
    }
    catch (error) {
      return next(error);
    }
  }

  getChartStatistics = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.orderService.getChartStatistics(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data,
      });
      return
    } catch (error) {
      return next(error);
    }
  }

  getChartStatisticsForShipper = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.orderService.getChartStatisticsForShipper(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data,
      });
      return
    } catch (error) {
      return next(error);
    }
  }
}

export default OrderController;
