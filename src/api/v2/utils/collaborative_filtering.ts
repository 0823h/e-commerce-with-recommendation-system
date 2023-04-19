import Feedback, { IFeedback } from '@src/configs/database/models/feedback.model';
import User, { IUser } from '@src/configs/database/models/user.model';
import Product, { IProduct } from '@src/configs/database/models/product.model';
// eslint-disable-next-line import/no-extraneous-dependencies
import nj from 'numjs';
import { ModelStatic } from 'sequelize';
import Matrix from './matrix';
import { IQuery } from '../modules/products/product.interface';
import { HttpException } from './http-exception';

class CF {
  private readonly feedbackModel: ModelStatic<IFeedback>;
  private readonly userModel: ModelStatic<IUser>;
  private readonly productModel: ModelStatic<IProduct>;
  private n_users: number;
  private n_products: number;

  constructor(n_users: number, n_products: number) {
    this.feedbackModel = Feedback;
    this.userModel = User;
    this.productModel = Product;
    this.n_users = n_users;
    this.n_products = n_products;
  }

  // eslint-disable-next-line class-methods-use-this
  initmatrix = async () => {
    const feedbacks = await this.feedbackModel.findAll();
    if (!feedbacks) {
      throw new HttpException('Cannot get feedbacks for CF', 409);
    }

    const user_query: IQuery = {
      order: [['id', 'ASC']],
    };

    const users = await this.userModel.findAll(user_query);
    if (!users) {
      throw new HttpException('Cannot get users for CF', 409);
    }

    console.log('n_users: ', this.n_users);

    const Y_data = new Matrix(this.n_users, this.n_products);

    for (let i = 0; i < this.n_users; i += 1) {
      for (let j = 0; j < feedbacks.length; j += 1) {
        if (feedbacks[j].user_id === users[i].id) {
          Y_data.setElement(i, feedbacks[j].product_id, feedbacks[j].rate);
        }
      }
    }

    console.log(Y_data);
  };
}

export default CF;
