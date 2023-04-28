import { Request, Response, NextFunction } from 'express';
import AuthService from './auth.services';

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.register(req.body);

      // console.log('GO 3');
      return res.status(201).json({
        status: 201,
        message: 'Success',
        data: user,
      });
    } catch (error) {
      console.log('eror', error);
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.authService.login(req.body);
      return res.status(200).json({
        status: 200,
        message: 'Success',
        data,
      });
    } catch (error) {
      console.log('error', error);
      return next(error);
    }
  };
}

export default AuthController;
