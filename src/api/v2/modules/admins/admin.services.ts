import Admin, { IAdmin } from '@models/admin.model';
import { Request as JWTRequest } from 'express-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { ModelStatic, Op } from 'sequelize';
import { HttpException } from '../../utils/http-exception';
import { bcryptComparePassword, bcryptHashPassword, generateToken } from '../../utils/functions';
import Order, { IOrder } from '@src/configs/database/models/order.model';
import { IQuery } from '../products/product.interface';
import { ppid } from 'process';

class AdminService {
  private readonly adminModel: ModelStatic<IAdmin>;
  private readonly orderModel: ModelStatic<IOrder>;
  constructor() {
    this.adminModel = Admin;
    this.orderModel = Order;
  }

  createAdmin = async (req: JWTRequest): Promise<IAdmin> => {
    try {
      const { full_name, username, role, password } = req.body;
      const adminExisted = await this.adminModel.findOne({
        where: {
          username,
        },
      });
      if (adminExisted) {
        throw new HttpException('This username has already been used by another account', 400);
      }
      const hashPassword = await bcryptHashPassword(password);
      console.log('hash password', hashPassword);
      const admin = await this.adminModel.create({
        username,
        password: hashPassword,
        full_name,
        role,
      });
      return admin;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  signIn = async (req: JWTRequest): Promise<Object> => {
    try {
      // Check if username exist
      const { username, password } = req.body;

      const admin = await this.adminModel.findOne({ where: { username } });

      if (!admin) {
        throw new HttpException('Username not existed', 404);
      }

      const isPasswordValid = await bcryptComparePassword(password, admin.password);

      if (!isPasswordValid) {
        throw new HttpException('Password is not correct', 401);
      }

      const access_token = await generateToken(
        `${process.env.ACCESS_TOKEN_SECRET_KEY}`,
        { admin_id: admin.id, admin_role: admin.role },
        `${process.env.ACCESS_TOKEN_TIME_EXPIRED}`
      );

      return { admin: admin, access_token };
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  // Shipper
  getOrdersForShipper = async (req: JWTRequest) => {
    try {
      const { admin_id } = (<JwtPayload>req.auth).data;

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';
      const { status } = req.query;

      const query: IQuery = {
        where: {
          assigned_to_shipper: admin_id
        },
        order: [[`${orderBy}`, `${(sort as string).toUpperCase()}`]],
      };

      query.offset = (page - 1) * limit;
      query.limit = limit;


      if (status) {
        console.log({ status })
        query.where = {
          ...query.where,
          status: { [Op.in]: [status] },
        };
      }

      const orders = await this.orderModel.findAndCountAll(query);

      return orders


    } catch (err) {
      throw err;
    }
  }

  getAdmins = async (req: JWTRequest) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';
      const { role } = req.query;

      const query: IQuery = {
        order: [[`${orderBy}`, `${(sort as string).toUpperCase()}`]],
      };

      query.offset = (page - 1) * limit;
      query.limit = limit;


      if (role) {
        query.where = {
          ...query.where,
          role
        };
      }

      const admins = await this.adminModel.findAndCountAll(query);

      return admins

    } catch (err) {
      throw err;
    }
  }

  getTotalShippingAmount = async (req: JWTRequest) => {
    try {
      const { admin_id } = (<JwtPayload>req.auth).data;

      const orders = await this.orderModel.findAll({
        where: {
          assigned_to_shipper: admin_id,
          status: {
            [Op.notIn]: ['Delivered successfully', 'Delivery failed']
          }
        }
      })

      let total_amount = 0;

      orders.map((order) => {
        total_amount += order.price;
      })

      return total_amount;
    } catch (err) {
      throw err;
    }
  }
}

export default AdminService;
