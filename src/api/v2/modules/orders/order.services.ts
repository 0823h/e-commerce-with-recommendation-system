import Order, { IOrder } from '@models/order.model';
import { ModelStatic } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { training } from '../../utils/predict_freud_order';

class OrderService {
  private readonly orderModel: ModelStatic<IOrder>;
  constructor() {
    this.orderModel = Order;
  }
  createOrder = async (req: JWTRequest): Promise<IOrder> => {
    try {
      const order = await this.orderModel.create({
        ...req.body,
      });
      return order;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  trainModel = async (req: JWTRequest) => {
    try {
      await training();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default OrderService;
