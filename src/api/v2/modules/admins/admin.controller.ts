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
}

export default AdminController;
