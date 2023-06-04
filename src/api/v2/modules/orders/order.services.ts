import Order, { IOrder } from '@models/order.model';
import OrderItem, { IOrderItem } from '@models/order_item.model';
import Product, { IProduct } from '@models/product.model';
import User, { IUser } from '@models/user.model';
import { ModelStatic } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { decisionTree, training } from '../../utils/predict_freud_order';
import { HttpException } from '../../utils/http-exception';
// import { vnpay_pay } from '../../utils/vnpay';
import moment from 'moment';
import { JwtPayload } from 'jsonwebtoken';
import { objectId } from '../../utils/functions';

class OrderService {
  private readonly orderModel: ModelStatic<IOrder>;
  private readonly orderItemModel: ModelStatic<IOrderItem>;
  private readonly productModel: ModelStatic<IProduct>;
  private readonly userModel: ModelStatic<IUser>;
  constructor() {
    this.orderModel = Order;
    this.orderItemModel = OrderItem;
    this.productModel = Product;
    this.userModel = User;
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
        str.push(encodeURIComponent(key));
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
}

export default OrderService;
