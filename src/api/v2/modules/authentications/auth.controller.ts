import { Request, Response, NextFunction } from 'express';
import AuthService from './auth.service';

class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.register(req.body);

      // console.log('GO 3');
      return res.status(200).json({
        status: 201,
        message: 'Success',
        data: user,
      });
    } catch (error) {
      console.log('eror', error);
      return next(error);
    }
  };
}

export default AuthController;
