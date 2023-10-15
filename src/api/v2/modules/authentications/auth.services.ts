import { Model, ModelStatic, Op } from 'sequelize';
import User, { IUser } from '@src/configs/database/models/user.model';
import Cart, { ICart } from '@src/configs/database/models/cart.model';
import UserCount, { IUserCount } from '@src/configs/database/models/user_count.model';
import { IAuthLogin, IAuthRegister } from './auth.interface';
import { HttpException } from '../../utils/http-exception';
import { bcryptComparePassword, bcryptHashPassword, generateToken, objectId } from '../../utils/functions';

class AuthService {
  private readonly userModel: ModelStatic<IUser>;
  private readonly cartModel: ModelStatic<ICart>;
  private readonly userCountModel: ModelStatic<IUserCount>;

  constructor() {
    this.userModel = User;
    this.cartModel = Cart;
    this.userCountModel = UserCount;
  }

  register = async (payload: IAuthRegister): Promise<IUser> => {
    try {
      console.log(payload);
      const { phone_number, email } = payload;

      console.log(phone_number);
      console.log(email);
      const user_existed = await this.userModel.findOne({
        where: { [Op.or]: [{ phone_number }, { email }] },
      });

      if (user_existed) {
        throw new HttpException('Email or Phone number has been already taken', 400);
      }
      const n_users = (await this.userModel.findAndCountAll()).count;
      const hashPassword: string = await bcryptHashPassword(<string>payload.password);

      const user = await this.userModel.create({
        ...payload,
        user_id: n_users,
        password: hashPassword,
        id: n_users,
      });
      if (!user) {
        throw new HttpException('Cannot create user', 409);
      }

      // Create cart
      // const user_cart = await this.cartModel.create({
      //   user_id: user.id,
      // });

      // if (!user_cart) {
      //   throw new HttpException('Cannot create cart for user', 409);
      // }

      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  login = async (payload: IAuthLogin): Promise<object> => {
    try {
      const { email = '', password = '' } = payload;
      const user = await this.userModel.findOne({ where: { email } });

      if (!user || user.deleted === true) {
        throw new HttpException('User not found', 404);
      }

      const isPasswordValid = await bcryptComparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new HttpException('Password is not correct', 403);
      }

      if (user.email_verified === false) {
        throw new HttpException('Please verify your email', 409);
      }

      const token = await generateToken(
        `${process.env.ACCESS_TOKEN_SECRET_KEY}`,
        { user_id: user.id },
        `${process.env.ACCESS_TOKEN_TIME_EXPIRED}`
      );

      // create cart if not exist
      const cart = await this.cartModel.findOne({
        where: {
          user_id: user.id,
        },
      });

      if (!cart) {
        const user_cart = await this.cartModel.create({
          user_id: user.id,
        });
        if (!user_cart) {
          throw new HttpException('Cart not found', 404);
        }
      }

      return { user, access_token: token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default AuthService;
