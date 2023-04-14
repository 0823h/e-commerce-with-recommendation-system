import { ModelStatic, Op } from 'sequelize';
import User, { IUser } from '@src/configs/database/models/user.model';
import { IAuthRegister } from './auth.interface';
import { HttpException } from '../../utils/http-exception';
import { bcryptHashPassword, objectId } from '../../utils/functions';

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
        throw new HttpException('Email or Phone number has been already taken', 400);
      }

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
}

export default AuthService;
