import Feedback, { IFeedback } from '@src/configs/database/models/feedback.model';
import User, { IUser } from '@src/configs/database/models/user.model';
import Product, { IProduct } from '@src/configs/database/models/product.model';
// eslint-disable-next-line import/no-extraneous-dependencies
import nj from 'numjs';
import { ModelStatic } from 'sequelize';
// eslint-disable-next-line import/no-extraneous-dependencies
import Matrix from './matrix';
import { IQuery } from '../modules/products/product.interface';
import { HttpException } from './http-exception';
import { cosine_similarity } from './functions';

class CF {
  private readonly feedbackModel: ModelStatic<IFeedback>;
  private readonly userModel: ModelStatic<IUser>;
  private readonly productModel: ModelStatic<IProduct>;
  private readonly user_id: number;
  private n_users: number;
  private n_products: number;

  constructor(n_users: number, n_products: number, user_id: number) {
    this.feedbackModel = Feedback;
    this.userModel = User;
    this.productModel = Product;
    this.n_users = n_users;
    this.n_products = n_products;
    this.user_id = user_id;
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

    const Y_data = new Matrix(this.n_products, this.n_users);

    Y_data.print();

    for (let i = 0; i < this.n_users; i += 1) {
      for (let j = 0; j < feedbacks.length; j += 1) {
        if (feedbacks[j].user_id === users[i].id) {
          console.log('Row: ', feedbacks[j].product_id, 'Column: ', users[i].id, 'Value: ', feedbacks[j].rate);
          Y_data.setData(feedbacks[j].product_id, users[i].id, feedbacks[j].rate);
        }
      }
    }

    Y_data.print();
    console.log('----------');
    Y_data.print();
    // const a = nj.arange(12).reshape(3, 4).tolist(); // 1d array
    // console.log(a);

    console.log('row:', Y_data.getRow(4).toJSON());
    console.log('col: ', Y_data.getColumn(0).toJSON());

    console.log('m_users: ', Y_data.getMeanUsers().toJSON());

    console.log('Y_bar_data: ');
    const Y_bar_data = Y_data.getYbar();
    Y_bar_data.print();

    // console.log(Y_bar_data.getColumn(1).tolist());
    // console.log(Y_bar_data.getColumn(2).tolist());
    const distant = cosine_similarity(Y_bar_data.getColumn(0).tolist(), Y_bar_data.getColumn(2).tolist());

    console.log(distant);
    console.log(Y_data.getUsersWhoRateProduct(this.user_id, 1));
    console.log('Product not rate: ', Y_data.getProductsNotRateYet(this.user_id));
  };
}

export default CF;
