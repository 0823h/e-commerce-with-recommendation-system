import User, { IUser } from '@src/configs/database/models/user.model';
import { ModelStatic, Op } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { IQuery } from '../products/product.interface';
import { HttpException } from '../../utils/http-exception';
import { bcryptHashPassword } from '../../utils/functions';

class UserService {
  private readonly userModel: ModelStatic<IUser>;
  constructor() {
    this.userModel = User;
  }

  getUsers = async (req: JWTRequest) => {
    try {
      const { page, limit } = req.query;
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';

      const query: IQuery = {
        where: { deleted: false },
        order: [[`${orderBy}`, `${(sort as string).toUpperCase()}`]],
      };

      if (page && limit) {
        query.offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
        query.limit = parseInt(limit as string, 10);
      }

      console.log('query: ', query);

      const products = await this.userModel.findAndCountAll(query);

      if (!products) {
        throw new HttpException('Product not found', 404);
      }
      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getUser = async (req: JWTRequest) => {
    try {
      const user_id = req.params.id;
      const user = await this.userModel.findByPk(user_id);

      if (!user || user.deleted === true) {
        throw new HttpException('User not found', 404);
      }

      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  updateUser = async (req: JWTRequest) => {
    try {
      const user_id = req.params.id;
      const user = await this.userModel.findByPk(user_id);

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      await user.update(req.body);
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  deleteUser = async (req: JWTRequest) => {
    try {
      const user_id = req.params.id;

      const user = await this.userModel.findByPk(user_id);

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      await user.update({
        deleted: true,
      });

      // await this.userModel.destroy({ where: { id: user_id } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  createUser = async (req: JWTRequest) => {
    try {
      const { phone_number, email, password } = req.body;

      const user_existed = await this.userModel.findOne({
        where: { [Op.or]: [{ phone_number }, { email }] },
      });

      const n_users = (await this.userModel.findAndCountAll()).count;

      if (user_existed) {
        throw new HttpException('Email or Phone number has been already taken', 400);
      }

      const hashPassword: string = await bcryptHashPassword(<string>password);

      const user = await this.userModel.create({
        ...req.body,
        password: hashPassword,
        id: n_users,
      });

      if (!user) {
        throw new HttpException('Cannot create user', 409);
      }

      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default UserService;
