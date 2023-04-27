import Admin, { IAdmin } from '@models/admin.model';
import { Request as JWTRequest } from 'express-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { ModelStatic } from 'sequelize';
import { HttpException } from '../../utils/http-exception';
import { bcryptHashPassword } from '../../utils/functions';

class AdminService {
  private readonly adminModel: ModelStatic<IAdmin>;
  constructor() {
    this.adminModel = Admin;
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
}

export default AdminService;
