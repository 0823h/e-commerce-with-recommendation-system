import Product, { IProduct } from '@models/product.model';
import Category, { ICategory } from '@src/configs/database/models/category.model';
import ProductCategory, { IProductCategory } from '@src/configs/database/models/product_category.model';
import { ModelStatic } from 'sequelize';
import { Request as JWTRequest } from 'express-jwt';
import { HttpException } from '../../utils/http-exception';
import { IQuery } from './product.interface';
import { objectId } from '../../utils/functions';

class ProductService {
  private readonly productModel: ModelStatic<IProduct>;
  private readonly productCategoryModel: ModelStatic<IProductCategory>;
  private readonly categoryModel: ModelStatic<ICategory>;
  constructor() {
    this.productModel = Product;
    this.productCategoryModel = ProductCategory;
    this.categoryModel = Category;
  }

  getAllProducts = async (req: JWTRequest): Promise<{ rows: IProduct[]; count: number }> => {
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

      const products = await this.productModel.findAndCountAll(query);

      if (!products) {
        throw new HttpException('Product not found', 404);
      }

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  createProduct = async (req: JWTRequest): Promise<IProduct> => {
    try {
      const id = objectId();
      const product = await this.productModel.create({
        id,
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
}

export default ProductService;
