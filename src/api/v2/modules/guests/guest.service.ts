import Guest, { IGuest } from '@models/guest.model';
import UserCount, { IUserCount } from '@models/user_count.model';
import Product, { IProduct } from '@src/configs/database/models/product.model';
import Feedback, { IFeedback } from '@src/configs/database/models/feedback.model';
import { ModelStatic } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { HttpException } from '../../utils/http-exception';
import { objectId } from '../../utils/functions';
class GuestService {
  private readonly guestModel: ModelStatic<IGuest>;
  private readonly userCountModel: ModelStatic<IUserCount>
  private readonly productModel: ModelStatic<IProduct>
  private readonly feedbackModel: ModelStatic<IFeedback>
  constructor() {
    this.guestModel = Guest;
    this.userCountModel = UserCount;
    this.productModel = Product;
    this.feedbackModel = Feedback;
  }
  async createGuest(req: JWTRequest): Promise<IGuest> {
    try {
      const userCount = await this.userCountModel.findOne();
      if (!userCount) {
        throw new HttpException('User count not found', 500);
      }
      const guest = await this.guestModel.create({
        user_id: userCount.user_count,
        ...req.body
      })
      await userCount.update({ user_count: userCount.user_count + 1 })
      return guest;
    }
    catch (error) {
      throw error;
    }
  }
  async rateProduct(req: JWTRequest): Promise<IFeedback> {
    try {
      const product_id = req.params.id;
      console.log(req.params);
      const product = await this.productModel.findByPk(product_id);
      if (!product) {
        throw new HttpException('Product not found', 404);
      }
      const userCount = await this.userCountModel.findOne();
      if (!userCount) {
        throw new HttpException('User count not found', 404);
      }
      const cookie_id = req.body.cookie_id;
      let id = objectId();
      const [guest, guestCreated] = await this.guestModel.findOrCreate({
        where: { cookie_id },
        defaults: {
          id,
          user_id: userCount.user_count,
          cookie_id,
        }
      })
      console.log('guest: ' + guest);
      if (guestCreated === true) {
        userCount.update({ user_count: userCount.user_count + 1 });
      }
      const rating = req.body.rating;
      id = objectId();
      const [feedback, feedbackCreated] = await this.feedbackModel.findOrCreate({
        where: { product_id: product.id, guest_id: guest.id },
        defaults: {
          id,
          product_id: product.id,
          guest_id: guest.id,
          rating,
        }
      })
      if (!feedbackCreated) {
        await feedback.update({ rating });
      }
      return feedback;
    } catch (error) {
      throw error;
    }
  }
}
export default GuestService;

