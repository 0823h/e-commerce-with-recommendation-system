import Order, { IOrder } from '@models/order.model';
import OrderItem, { IOrderItem } from '@models/order_item.model';
import Product, { IProduct } from '@models/product.model';
import User, { IUser } from '@models/user.model';
import Variant, { IVariant } from '@models/variant.model';
import Admin, { IAdmin } from '@src/configs/database/models/admin.model';
import { ModelStatic, Op } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { decisionTree, training } from '../../utils/predict_freud_order';
import { HttpException } from '../../utils/http-exception';
// import { vnpay_pay } from '../../utils/vnpay';
import moment from 'moment';
import { JwtPayload } from 'jsonwebtoken';
import { objectId } from '../../utils/functions';
import { IQuery } from '../products/product.interface';
import PaymentMethod, { IPaymentMethod } from '@src/configs/database/models/payment_method.model';
class OrderService {
  private readonly orderModel: ModelStatic<IOrder>;
  private readonly orderItemModel: ModelStatic<IOrderItem>;
  private readonly productModel: ModelStatic<IProduct>;
  private readonly userModel: ModelStatic<IUser>;
  private readonly variantModel: ModelStatic<IVariant>;
  private readonly paymentMethodModel: ModelStatic<IPaymentMethod>;
  private readonly adminModel: ModelStatic<IAdmin>;
  constructor() {
    this.orderModel = Order;
    this.orderItemModel = OrderItem;
    this.productModel = Product;
    this.userModel = User;
    this.variantModel = Variant;
    this.paymentMethodModel = PaymentMethod;
    this.adminModel = Admin;
  }
  adminCreateOrder = async (req: JWTRequest): Promise<IOrder> => {
    try {
      const { user_id, payment_method_id } = req.body;
      const order_items = req.body.order;

      // Check if user_id and user existed
      if (!user_id) {
        throw new HttpException('User id not found', 404);
      }
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User id not found', 404);
      }

      // Check if payment method existed
      if (!payment_method_id) {
        throw new HttpException('Payment method id not found', 404);
      }
      const payment_method = await this.paymentMethodModel.findByPk(payment_method_id);
      if (!payment_method) {
        throw new HttpException('Payment method id not found', 404);
      }

      // Create order
      const order = await this.orderModel.create({
        // user_id: user.id,
        user_id: user.id,
        customer_name: req.body.customer_name,
        phone_number: req.body.phone_number,
        // phone_number: user.phone_number,
        email: req.body.email,
        status: req.body.status,
        address: req.body.address,
        payment_method_id: payment_method.id,
        created_by: 'admin'
      });

      let total_order_quantity = 0;
      let total_order_price = 0;

      const createOrderItemsPromise = order_items.map(async (order_item: any) => {
        await this.orderItemModel.create({
          order_id: order.id,
          ...order_item,
        });
        total_order_quantity = total_order_quantity + order_item.quantity;
        const variant = await this.variantModel.findByPk(order_item.variant_id);
        if (!variant) {
          throw new HttpException(`Variant with id ${order_item.variant_id} not found`, 404);
        }
        const product = await this.productModel.findByPk(variant.product_id);
        if (!product) {
          throw new HttpException(`Product with id ${order_item.product_id} not found`, 404);
        }
        total_order_price = total_order_price + order_item.quantity * product.current_price;
      });

      await Promise.all(createOrderItemsPromise);

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

  vnpay = async (req: JWTRequest) => {
    try {
      const { user_id } = (<JwtPayload>req.auth).data;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User not found', 403);
      }

      const { total_order_amount, price } = req.body;

      const order = await this.orderModel.create({
        id: objectId(),
        user_id,
        price,
        total_order_amount,
        address: user.address,
        phone_number: user.phone_number,
        email: user.email,
        is_fraud: false,
      });

      process.env.TZ = 'Asia/Ho_Chi_Minh';

      let date = new Date();
      let createDate = moment(date).format('YYYYMMDDHHmmss');

      let ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.socket.remoteAddress;

      // let config = require('config');

      let tmnCode = process.env.vnp_TmnCode;
      let secretKey = process.env.vnp_HashSecret;
      let vnpUrl = process.env.vnp_Url;
      let returnUrl = process.env.vnp_ReturnUrl;
      // let returnUrl = config.get('vnp_ReturnUrl');
      let orderId = moment(date).format('DDHHmmss');
      // let amount = req.body.amount;
      let bankCode = process.env.vnp_BankCode;
      // let bankCode = req.body.bankCode;

      let locale = req.body.language;
      if (locale === null || locale === '') {
        locale = 'vn';
      }
      let currCode = 'VND';
      let vnp_Params: any = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = 'vn';
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = order.id;
      // vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma don hang:' + orderId;
      vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma don hang:' + order.id;
      vnp_Params['vnp_OrderType'] = 'other';
      // vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_Amount'] = order.price * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      // vnp_Params['vnp_CreateDate'] = createDate;
      vnp_Params['vnp_CreateDate'] = moment(order.createdAt).format('YYYYMMDDHHmmss');
      if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      vnp_Params = this.sortObject(vnp_Params);

      let querystring = require('qs');
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require('crypto');
      let hmac = crypto.createHmac('sha512', secretKey);
      let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;

      console.log('vnp_params:', vnp_Params);

      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
      console.log('vnpUrl: ' + vnpUrl);
      return vnpUrl;
      // res.redirect(vnpUrl);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  sortObject = (obj: any) => {
    let sorted: any = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key)); ``
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  };

  getUniqueId = () => {
    return objectId();
  };

  getOrders = async (req: JWTRequest) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';

      const query: IQuery = {
        order: [[`${orderBy}`, `${(sort as string).toUpperCase()}`]],
        // include: { model: OrderItem, through: { attributes: [] } }
      };

      query.offset = (page - 1) * limit;
      query.limit = limit;
      const orders = await this.orderModel.findAndCountAll(query);

      return orders;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  userCreateOrder = async (req: JWTRequest) => {
    try {
      const { user_id } = (<JwtPayload>req.auth).data;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      // Check payment method
      const payment_method_id = req.body.payment_method_id
      if (!payment_method_id) {
        throw new HttpException('Payment method not found', 404);
      }
      const payment_method = await this.paymentMethodModel.findByPk(payment_method_id);
      if (!payment_method) {
        throw new HttpException('Payment method not found', 404);
      }

      // Create order
      const order = await this.orderModel.create({
        user_id: user.id,
        // user_id: 1,
        phone_number: req.body.phone_number,
        customer_name: user.first_name + user.last_name,
        // phone_number: user.phone_number,
        email: req.body.email,
        status: 'Preparing order',
        address: req.body.address,
        payment_method_id: payment_method.id,
        created_by: 'user'
      });

      // Create order items
      const order_items = req.body.order;
      let total_order_quantity = 0;
      let total_order_price = 0;

      const createOrderItemsPromise = order_items.map(async (order_item: any) => {
        await this.orderItemModel.create({
          order_id: order.id,
          ...order_item,
        });
        total_order_quantity = total_order_quantity + order_item.quantity;
        const variant = await this.variantModel.findByPk(order_item.variant_id);
        if (!variant) {
          throw new HttpException(`Variant with id ${order_item.variant_id} not found`, 404);
        }
        const product = await this.productModel.findByPk(variant.product_id);
        if (!product) {
          throw new HttpException(`Product with id ${order_item.product_id} not found`, 404);
        }
        total_order_price = total_order_price + order_item.quantity * product.current_price;
      });

      await Promise.all(createOrderItemsPromise);

      // Update order with price and total amount
      await order.update({
        price: total_order_price,
        total_order_amount: total_order_quantity,
      });

      // Return order
      return order;
    } catch (error) {
      throw error;
    }
  };

  changeOrderStatus = async (req: JWTRequest) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpException('Order id not found on param', 404);
      }
      const order = await this.orderModel.findByPk(id);
      if (!order) {
        throw new HttpException('Order not found', 404);
      }

      await order.update({
        status: req.body.status,
      })

      await order.save();

      return order;
    } catch (error) {
      throw error;
    }
  }


  getOrderProducts = async (req: JWTRequest) => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new HttpException("Order id not found", 404);
      }

      const order_items = await this.orderItemModel.findAll({
        where: {
          order_id: id
        },
        include: [{
          model: Variant,
          include: [{ model: Product }]
        },
        ]
      })

      return order_items
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Admin service
  assignToShipper = async (req: JWTRequest) => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new HttpException("Order id not found", 404);
      }

      const order = await this.orderModel.findByPk(id);
      if (!order) {
        throw new HttpException("Order not found", 404);
      }

      const { shipper_id } = req.body;
      if (!shipper_id) {
        throw new HttpException("Shipper id not found", 404);
      }

      // console.log({ body: req.body });
      const shipper = await this.adminModel.findOne({
        where: {
          id: shipper_id,
          role: 'shipper'
        }
      });

      if (!shipper) {
        throw new HttpException("Shipper not found", 404);
      }

      await order.update({
        assigned_to_shipper: shipper.id
      })

      return order;
    } catch (error) {
      throw error;
    }
  }

  getStatistics = async (req: JWTRequest) => {
    try {
      const { start_date, end_date } = req.query
      // 2023-10-13 -> 2023-11-13

      const object = {
        total_money: 0,
        number_of_orders: 0,
      }

      const orders = await this.orderModel.findAndCountAll(
        {
          where: {
            createdAt: {
              [Op.between]: [start_date, end_date]
            },
            status: 'Delivered successfully',
          }
        }
      )

      orders.rows.map((order) => {
        object.total_money += order.price;
        object.number_of_orders += order.total_order_amount;
      })

      return object;
    } catch (error) {
      throw error
    }
  }
}

export default OrderService;
