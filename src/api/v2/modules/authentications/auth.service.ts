import { ModelStatic, Op } from 'sequelize';
import User, { IUser } from '@src/configs/database/models/user.model';
import { IAuthLogin, IAuthRegister } from './auth.interface';
import { HttpException } from '../../utils/http-exception';
import { bcryptComparePassword, bcryptHashPassword, generateToken, objectId } from '../../utils/functions';

class AuthService {
  private readonly userModel: ModelStatic<IUser>;

  constructor() {
    this.userModel = User;
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
        // console.log('Go 1');

        throw new HttpException('Email or Phone number has been already taken', 400);
      }
      // console.log('Go 2');
      const id = objectId();
      const hashPassword: string = await bcryptHashPassword(<string>payload.password);
      const user = await this.userModel.create({
        ...payload,
        password: hashPassword,
        id,
      });

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

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const isPasswordValid = await bcryptComparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new HttpException('Password is not correct', 403);
      }

      if (user.email_verified === false) {
        throw new HttpException('Please verify your email', 409);
      }

      const token = await generateToken(`${process.env.ACCESS_TOKEN_SECRET_KEY}`, { user_id: user.id }, '30m');

      return { user, access_token: token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default AuthService;
