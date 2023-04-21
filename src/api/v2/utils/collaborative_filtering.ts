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
  private k = 2;
  private n_users: number;
  private n_products: number;

  constructor(n_users: number, n_products: number, user_id: number, k = 2) {
    this.feedbackModel = Feedback;
    this.userModel = User;
    this.productModel = Product;
    this.n_users = n_users;
    this.n_products = n_products;
    this.user_id = user_id;
    this.k = k;
  }

  // predict = (product_id) => {};

  loadYData = async (): Promise<Matrix> => {
    try {
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

      return Y_data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  predict = (Y_data: Matrix, Y_bar_data: Matrix, product_id: number) => {
    const users_ids_who_rate_product = Y_data.getUsersWhoRateProduct(this.user_id, product_id);
    console.log('userid who rate: ', users_ids_who_rate_product);

    const similarity_vector: number[][] = nj
      .zeros([users_ids_who_rate_product.length, 2])
      .subtract(nj.ones([users_ids_who_rate_product.length, 2]))
      .tolist();
    console.log(similarity_vector);

    users_ids_who_rate_product.forEach((user) => {
      similarity_vector[user] = [
        user,
        cosine_similarity(Y_bar_data.getColumn(this.user_id).tolist(), Y_bar_data.getColumn(user).tolist()),
      ];
    });

    similarity_vector.sort((a, b) => {
      return b[1] - a[1];
    });

    console.log('sorted sv: ', similarity_vector);

    if (this.k > similarity_vector.length) {
      this.k = similarity_vector.length;
    }

    let predict_value = 0;
    let similarity_total = 0;

    const m_users = Y_data.getMeanUsers().tolist();
    console.log('m_users: ', m_users);
    for (let i = 0; i < this.k; i += 1) {
      predict_value += m_users[similarity_vector[i][0]] * similarity_vector[i][1];
      console.log(`m_users[similarity_vector[${i}][0]]: `, m_users[similarity_vector[i][0]]);
      console.log(`similarity_vector[${i}][1]: `, similarity_vector[i][1]);
      console.log(`Math.abs(similarity_vector[${i}][1])`, Math.abs(similarity_vector[i][1]));
      similarity_total += Math.abs(similarity_vector[i][1]);
    }
    console.log('p_v: ', predict_value, 's_t: ', similarity_total);
    return predict_value / (similarity_total + 1e-10);
  };

  runCF = async () => {
    // const a = nj.arange(12).reshape(3, 4).tolist(); // 1d array
    // console.log(a);

    const Y_data = await this.loadYData();
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

    // const predict_product = nj.zeros(this.n_products);

    const products_not_rated_yet_ids = Y_data.getProductsNotRateYet(this.user_id);
    const suggest_products: number[][] = [];
    products_not_rated_yet_ids.forEach((product_id) => {
      console.log(this.predict(Y_data, Y_bar_data, product_id));
      suggest_products.push([product_id, this.predict(Y_data, Y_bar_data, product_id)]);
    });

    console.log(suggest_products);
    return suggest_products;
  };
}

// eslint-disable-next-line class-methods-use-this

export default CF;
