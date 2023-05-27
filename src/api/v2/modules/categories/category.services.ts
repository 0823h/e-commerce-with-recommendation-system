import Category, { ICategory } from '@src/configs/database/models/category.model';
import Product, { IProduct } from '@src/configs/database/models/product.model';
import { ModelStatic } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { HttpException } from '../../utils/http-exception';
import { IQuery } from '../products/product.interface';
import { objectId } from '../../utils/functions';

class CategoryService {
  private readonly categoryModel: ModelStatic<ICategory>;
  private readonly productModel: ModelStatic<IProduct>;

  constructor() {
    this.categoryModel = Category;
    this.productModel = Product;
  }

  getAllCategories = async (req: JWTRequest): Promise<{ rows: ICategory[]; count: number }> => {
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

      const categories = await this.categoryModel.findAndCountAll(query);

      if (categories == null) {
        throw new HttpException('Failed to get category', 409);
      }

      return categories;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  createCategory = async (req: JWTRequest): Promise<ICategory> => {
    try {
      const id = objectId();
      const category = await this.categoryModel.create({
        id,
        ...req.body,
      });

      if (!category) {
        throw new HttpException('Cannot create category', 409);
      }

      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getCategoryProduct = async (req: JWTRequest) => {
    try {
      const { category_id } = req.params;
      const category = await this.categoryModel.findAll({
        where: { id: category_id },
        include: { model: Product, through: {} },
      });
      return category;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
}

export default CategoryService;
