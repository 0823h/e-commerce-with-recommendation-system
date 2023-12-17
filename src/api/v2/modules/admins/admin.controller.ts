import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import AdminService from './admin.services';

class AdminController {
  private readonly adminService: AdminService;
  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  createAdmin = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const admin = await this.adminService.createAdmin(req);
      return res.status(201).json({
        status: 201,
        message: 'success',
        data: admin,
      });
    } catch (error) {
      return next(error);
    }
  };

  signIn = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.adminService.signIn(req);
      return res.status(201).json({
        status: 201,
        message: 'success',
        data,
      });
    } catch (error) {
      return next(error);
    }
  };

  getOrdersForShipper = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await this.adminService.getOrdersForShipper(req);

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = orders.rows.length;
      const total_pages = Math.ceil(orders.count / limit);
      const total_count = orders.count;

      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          records: orders.rows,
          metadata: {
            page,
            limit,
            page_count,
            total_pages,
            total_count,
          },
        }
      })
    } catch (error) {
      return next(error);
    }
  }

  getAdmins = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const admins = await this.adminService.getAdmins(req);

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = admins.rows.length;
      const total_pages = Math.ceil(admins.count / limit);
      const total_count = admins.count;

      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          records: admins.rows,
          metadata: {
            page,
            limit,
            page_count,
            total_pages,
            total_count,
          },
        }
      })
    } catch (error) {
      return next(error);
    }
  }
}

export default AdminController;
