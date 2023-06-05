import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import UserService from './user.services';

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  getUsers = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getUsers(req);

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = users.rows.length;
      const total_pages = Math.ceil(users.count / limit);
      const total_count = users.count;

      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          records: users.rows,
          metadata: {
            page,
            limit,
            page_count,
            total_pages,
            total_count,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  getUser = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUser(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };

  updateUser = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.updateUser(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };

  deleteUser = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      await this.userService.deleteUser(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: 1,
      });
    } catch (error) {
      return next(error);
    }
  };

  createUser = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(req);
      return res.status(200).json({
        status: 201,
        message: 'success',
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default UserController;
