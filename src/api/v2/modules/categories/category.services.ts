import Category, { ICategory } from '@src/configs/database/models/category.model';
import { ModelStatic } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { HttpException } from '../../utils/http-exception';
import { IQuery } from '../products/product.interface';

class CategoryService {
  private readonly categoryModel: ModelStatic<ICategory>;

  constructor() {
    this.categoryModel = Category;
  }

  getAllCategories = async (req: JWTRequest): Promise<{ rows: ICategory[]; count: number }> => {
    try {
      const { page, limit } = req.query;
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';

      const query: IQuery = {
        where: { deleted: false },
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
}
