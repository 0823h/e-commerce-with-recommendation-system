import Product, { IProduct } from '@models/product.model';
import Category, { ICategory } from '@src/configs/database/models/category.model';
import ProductCategory, { IProductCategory } from '@src/configs/database/models/product_category.model';
import Feedback, { IFeedback } from '@src/configs/database/models/feedback.model';
import User, { IUser } from '@src/configs/database/models/user.model';
import Variant, { IVariant } from '@src/configs/database/models/variant.model';
import { ModelStatic, Op } from 'sequelize';
import { JwtPayload } from 'jsonwebtoken';
import { Request as JWTRequest } from 'express-jwt';
import { HttpException } from '../../utils/http-exception';
import { IQuery } from './product.interface';
import { objectId } from '../../utils/functions';
import CF from '../../utils/collaborative_filtering';
import es_client from '@src/configs/elasticsearch';

class ProductService {
  private readonly productModel: ModelStatic<IProduct>;
  private readonly productCategoryModel: ModelStatic<IProductCategory>;
  private readonly categoryModel: ModelStatic<ICategory>;
  private readonly feedbackModel: ModelStatic<IFeedback>;
  private readonly userModel: ModelStatic<IUser>;
  private readonly variantModel: ModelStatic<IVariant>;
  constructor() {
    this.productModel = Product;
    this.productCategoryModel = ProductCategory;
    this.categoryModel = Category;
    this.feedbackModel = Feedback;
    this.userModel = User;
    this.variantModel = Variant;
  }

  getAllProducts = async (req: JWTRequest): Promise<{ rows: IProduct[]; count: number }> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      // console.log('page: ' + page + ' limit: ' + limit);
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';

      const query: IQuery = {
        // where: { deleted: false },
        // include: [{ model: this.categoryModel, attributes: ['name'] }],
        include: [{ model: this.categoryModel, attributes: ['name'], through: { attributes: [] } }],
        distinct: true,
        order: [[`${orderBy}`, `${(sort as string).toUpperCase()}`]],
      };

      query.offset = (page - 1) * limit;
      query.limit = limit;

      console.log('query: ', query);

      const products = await this.productModel.findAndCountAll(query);

      // const products2 = await this.productModel.findAndCountAll();
      // console.log('products2' + products2.count);
      console.log('count' + products.count);

      if (!products) {
        throw new HttpException('Product not found', 404);
      }

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getVariantOfProduct = async (req: JWTRequest): Promise<{ product: IProduct; rows: IVariant[]; count: number }> => {
    try {
      const { id } = req.params;
      const product = await this.productModel.findByPk(id, {
        include: [{ model: this.categoryModel, attributes: ['name'], through: { attributes: [] } }],
      });
      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      const { page, limit, colour } = req.query;
      const sort = req.query.sort || 'DESC';
      const orderBy: string = (req.query.orderBy as string) || 'createdAt';

      const query: IQuery = {
        where: { product_id: id },
        order: [[`${orderBy}`, `${(sort as string).toUpperCase()}`]],
      };

      if (page && limit) {
        query.offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
        query.limit = parseInt(limit as string, 10);
      }

      if (colour) {
        query.where = {
          ...query.where,
          colour: { [Op.iLike]: `%${colour}%` },
        };
      }

      console.log('Query: ', query);

      const variants = await this.variantModel.findAndCountAll(query);
      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      return { product, ...variants };
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

      this.reindexProducts();
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

      this.reindexFeedbacks();
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

  createVariant = async (req: JWTRequest) => {
    try {
      const product_id = req.params.id;
      const { quantity, size, colour } = req.body;
      const product = await this.productModel.findByPk(product_id);
      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      // const existed_variant = await this.variantModel.findOne({
      //   where: { [Op.and]: [{ size }, { colour }] },
      // });

      // if (existed_variant) {
      //   throw new HttpException('This variant for this product has already been defined', 401);
      // }

      const variant = await this.variantModel.create({
        product_id,
        quantity,
        size,
        colour,
      });

      return variant;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  // getAllProductOfCategory = async(req: JWTRequest) => {
  //   try{
  //     const product = await this.productModel.findAll({where: {}})
  //   }
  //   catch(error) {

  //   }
  // }

  reindexProducts = async () => {
    try {
      // Truy xuất dữ liệu từ cơ sở dữ liệu của bạn (ví dụ: từ MongoDB)
      await this.deleteAllDocumentsES("product_index")
      const products = await this.productModel.findAll();
      console.log(products.length);
      console.log(products[0]);

      // Tên index trong Elasticsearch
      const indexName = 'products_index';

      // Lặp qua dữ liệu và đánh index từng mục
      for (const item of products) {
        await es_client.index({
          index: indexName,
          body: item, // Điều này giả định rằng dữ liệu của bạn có định dạng phù hợp với Elasticsearch
        });
        // console.log(`Đã đánh index dữ liệu với ID: ${response.body._id}`);
      }

      return 1
    } catch (error) {
      return error;
    }
  }

  reindexFeedbacks = async () => {
    try {
      await this.deleteAllDocumentsES("feedback_index");
      const indexName = "feedback_index"
      const users = await this.userModel.findAll();
      users.forEach(async user => {
        let feedbacks = await this.feedbackModel.findAll({ attributes: ['product_id'], where: { user_id: user.id } });
        let liked_product_ids = feedbacks.map(el => el.product_id);
        await es_client.index({
          index: indexName,
          body: {
            user_id: user.id,
            liked_product_ids
          }
        })
      })
      return true
    } catch (error) {
      return error;
    }
  }

  deleteAllDocumentsES = async (indexName: string) => {
    try {
      const response = await es_client.deleteByQuery({
        index: indexName,
        body: {
          query: {
            match_all: {}, // Lọc tất cả documents
          },
        },
      });

      console.log(`Đã xóa ${response.deleted} documents từ index ${indexName}`);
    }
    catch (error) {
      return error;
    }
  }
}

export default ProductService;
