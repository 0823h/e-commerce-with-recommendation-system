import Admin, { IAdmin } from '@models/admin.model';
import { Request as JWTRequest } from 'express-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { ModelStatic } from 'sequelize';
import { HttpException } from '../../utils/http-exception';
import { bcryptComparePassword, bcryptHashPassword, generateToken } from '../../utils/functions';

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

      return { admin_id: admin.id, access_token };
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
}

export default AdminService;
