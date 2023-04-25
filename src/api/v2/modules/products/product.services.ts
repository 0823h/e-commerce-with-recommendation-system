import Product, { IProduct } from '@models/product.model';
import Category, { ICategory } from '@src/configs/database/models/category.model';
import ProductCategory, { IProductCategory } from '@src/configs/database/models/product_category.model';
import Feedback, { IFeedback } from '@src/configs/database/models/feedback.model';
import User, { IUser } from '@src/configs/database/models/user.model';
import { ModelStatic } from 'sequelize';
import { JwtPayload } from 'jsonwebtoken';
import { Request as JWTRequest } from 'express-jwt';
import { HttpException } from '../../utils/http-exception';
import { IQuery } from './product.interface';
import { objectId } from '../../utils/functions';
import CF from '../../utils/collaborative_filtering';

class ProductService {
  private readonly productModel: ModelStatic<IProduct>;
  private readonly productCategoryModel: ModelStatic<IProductCategory>;
  private readonly categoryModel: ModelStatic<ICategory>;
  private readonly feedbackModel: ModelStatic<IFeedback>;
  private readonly userModel: ModelStatic<IUser>;
  constructor() {
    this.productModel = Product;
    this.productCategoryModel = ProductCategory;
    this.categoryModel = Category;
    this.feedbackModel = Feedback;
    this.userModel = User;
  }

  getAllProducts = async (req: JWTRequest): Promise<{ rows: IProduct[]; count: number }> => {
    try {
      const { page, limit } = req.query;
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';

      const query: IQuery = {
        // where: { deleted: false },
        order: [[`${orderBy}`, `${(sort as string).toUpperCase()}`]],
      };

      if (page && limit) {
        query.offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
        query.limit = parseInt(limit as string, 10);
      }

      const products = await this.productModel.findAndCountAll(query);
      // console.log(products);

      if (!products) {
        throw new HttpException('Product not found', 404);
      }

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getProduct = async (req: JWTRequest): Promise<IProduct> => {
    try {
      const { id } = req.params;

      const product = await this.productModel.findByPk(id);
      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  createProduct = async (req: JWTRequest): Promise<IProduct> => {
    try {
      const n_products = (await this.productModel.findAndCountAll()).count;
      const product = await this.productModel.create({
        id: n_products,
        ...req.body,
      });

      if (product == null) {
        throw new HttpException('Cannot create product', 404);
      }

      const category_ids = req.body.categories;

      if (category_ids.length > 0) {
        const createCategoryPromises = category_ids.map(async (category_id: string) => {
          const category = await this.categoryModel.findByPk(category_id);
          if (category) {
            console.log(n_products);
            await this.productCategoryModel.create({
              id: objectId(),
              product_id: product.id,
              category_id,
            });
          }
        });

        await Promise.all(createCategoryPromises);
      }

      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  rateProduct = async (req: JWTRequest): Promise<IFeedback> => {
    try {
      const { user_id } = (<JwtPayload>req.auth).data;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User not found', 403);
      }

      // Product id
      const product_id = req.params.id;
      const product = await this.productModel.findByPk(product_id);
      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      const feedback = await this.feedbackModel.findOne({ where: { user_id, product_id } });
      if (!feedback) {
        const feedback = await this.feedbackModel.create({
          id: objectId(),
          user_id,
          product_id,
          ...req.body,
        });
        return feedback;
      }

      feedback.rate = req.body.rate;
      await feedback.save();
      return feedback;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  collaborativeFiltering = async (req: JWTRequest) => {
    try {
      const { user_id } = (<JwtPayload>req.auth).data;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User not found', 403);
      }
      const n_users = (await this.userModel.findAndCountAll()).count;
      const n_products = (await this.productModel.findAndCountAll()).count;
      const cf = new CF(n_users, n_products, user_id, 2);
      const product_suggested_ids = await cf.runCF();

      console.log('product_suggested_ids: ', product_suggested_ids);

      const product_suggested_ids_postive: number[][] = [];

      product_suggested_ids.forEach((id) => {
        if (id[1] > 0) {
          product_suggested_ids_postive.push(id);
        }
      });

      const products_promise = product_suggested_ids_postive.map(async (product_id) => {
        return await this.productModel.findByPk(product_id[0]);
      });

      const products = await Promise.all(products_promise);
      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default ProductService;
