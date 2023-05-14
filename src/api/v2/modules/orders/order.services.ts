import Order, { IOrder } from '@models/order.model';
import OrderItem, { IOrderItem } from '@models/order_item.model';
import Product, { IProduct } from '@models/product.model';
import { ModelStatic } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { decisionTree, training } from '../../utils/predict_freud_order';
import { HttpException } from '../../utils/http-exception';

class OrderService {
  private readonly orderModel: ModelStatic<IOrder>;
  private readonly orderItemModel: ModelStatic<IOrderItem>;
  private readonly productModel: ModelStatic<IProduct>;
  constructor() {
    this.orderModel = Order;
    this.orderItemModel = OrderItem;
    this.productModel = Product;
  }
  createOrder = async (req: JWTRequest): Promise<IOrder> => {
    try {
      const order_items = req.body.order;

      const order = await this.orderModel.create({
        user_id: req.body.user_id,
        address: req.body.address,
      });

      let total_order_quantity = 0;
      let total_order_price = 0;

      const createOrderPromise = order_items.map(async (order_item: any) => {
        await this.orderItemModel.create({
          order_id: order.id,
          ...order_item,
        });
        total_order_quantity = total_order_quantity + order_item.quantity;
        const product = await this.productModel.findByPk(order_item.product_id);
        if (!product) {
          throw new HttpException(`Product with id ${order_item.product_id} not found`, 404);
        }
        total_order_price = total_order_price + order_item.quantity * product.current_price;
      });

      await Promise.all(createOrderPromise);

      await order.update({
        price: total_order_price,
        total_order_amount: total_order_quantity,
      });

      return order;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  trainModel = async (req: JWTRequest) => {
    try {
      const order_info: IOrder = req.body;
      const is_fraud = await decisionTree(order_info);
      return is_fraud;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default OrderService;
