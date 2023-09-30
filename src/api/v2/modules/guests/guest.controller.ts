import GuestService from './guest.service';
import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
class GuestController {
  private guestService: GuestService;
  constructor(guestService: GuestService) {
    this.guestService = guestService;
  }
  createGuest = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const guest = await this.guestService.createGuest(req);
      return res.status(201).json({
        status: 201,
        message: 'success',
        data: guest
      })
    } catch (error) {
      return next(error)
    }
  }
  rateProduct = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const feedback = await this.guestService.rateProduct(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: feedback
      })
    } catch (error) {
      return next(error);
    }
  }
}
export default GuestController;