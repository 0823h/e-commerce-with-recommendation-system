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
import ContentBasedFiltering from '../../utils/content_based_filtering';
import es_client from '@src/configs/elasticsearch';
import Order, { IOrder } from '@src/configs/database/models/order.model';
import OrderItem, { IOrderItem } from '@src/configs/database/models/order_item.model';

import { Apriori } from '@src/api/v2/utils/apriori';

class ProductService {
  private readonly productModel: ModelStatic<IProduct>;
  private readonly productCategoryModel: ModelStatic<IProductCategory>;
  private readonly categoryModel: ModelStatic<ICategory>;
  private readonly feedbackModel: ModelStatic<IFeedback>;
  private readonly userModel: ModelStatic<IUser>;
  private readonly variantModel: ModelStatic<IVariant>;
  private readonly orderModel: ModelStatic<IOrder>;
  private readonly orderItemModel: ModelStatic<IOrderItem>;
  constructor() {
    this.productModel = Product;
    this.productCategoryModel = ProductCategory;
    this.categoryModel = Category;
    this.feedbackModel = Feedback;
    this.userModel = User;
    this.variantModel = Variant;
    this.orderModel = Order;
    this.orderItemModel = OrderItem;
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

      const { page, limit } = req.query;
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

      // if (colour) {
      //   query.where = {
      //     ...query.where,
      //     colour: { [Op.iLike]: `%${colour}%` },
      //   };
      // }

      console.log('Query: ', query);

      const variants = await this.variantModel.findAndCountAll(query);
      if (!product) {
        throw new HttpException('Product not found', 404);
      }

      await product.update({ view: product.view + 1 });
      await product.save();

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

      // this.reindexFeedbacks();
      return feedback;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  rateProductForGuest = async (req: JWTRequest) => {
    try {
      const { session_id, rate } = req.body;
      if (!session_id) {
        throw new HttpException("session_id not found", 404);
      }
      const product_id = req.params.id;
      if (!product_id) {
        throw new HttpException("product_id not found", 404);
      }

      const guest = await this.userModel.findOne({
        where: {
          session_id
        }
      })
      if (!guest) {
        throw new HttpException("Guest not found", 404);
      }

      const product = await this.productModel.findOne({
        where: {
          id: product_id
        }
      });
      if (!product) {
        throw new HttpException("Product not found", 404);
      }

      let feedback = await this.feedbackModel.findOne({
        where: {
          user_id: guest.id,
          product_id
        }
      })
      if (!feedback) {
        feedback = await this.feedbackModel.create({
          id: objectId(),
          user_id: guest.id,
          product_id,
          rate
        })

        return feedback;
      }
      await feedback.update({ rate });
      await feedback.save();
      return feedback;
    } catch (error) {
      throw error;
    }
  }


  collaborativeFiltering = async (req: JWTRequest) => {
    try {
      const { user_id } = (<JwtPayload>req.auth).data;
      const user = await this.userModel.findByPk(user_id);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      const n_users = (await this.userModel.findAndCountAll()).count;
      const n_products = (await this.productModel.findAndCountAll()).count;

      // Get Recommendation Score Of All Products
      const cf = new CF(n_users, n_products, user_id, 2);
      const product_suggested_ids = await cf.runCF();

      // [PRINT] All Predict Scores Of User
      console.log('All Predict Scores Of User: ', product_suggested_ids);
      // -------------END PRINTING----------------

      const product_suggested_ids_postive: number[][] = [];

      // Filtering Score > 0
      product_suggested_ids.forEach((id) => {
        if (id[1] > 0) {
          product_suggested_ids_postive.push(id);
        }
      });

      // Query For Products Name From Ids
      const products_promise = product_suggested_ids_postive.map(async (product_id) => {
        return await this.productModel.findByPk(product_id[0]);
      });

      const products = await Promise.all(products_promise);

      // Return !!!
      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  collaborativeFilteringForGuest = async (req: JWTRequest) => {
    try {
      const { session_id } = req.body;
      if (!session_id) {
        throw new HttpException('session_id not found', 404);
      }
      const user = await this.userModel.findOne({
        where: {
          session_id
        }
      });
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      // console.log("user: " + user);

      const n_users = (await this.userModel.findAndCountAll()).count;
      const n_products = (await this.productModel.findAndCountAll()).count;
      const cf = new CF(n_users, n_products, user.id, 2);
      const product_suggested_ids = await cf.runCF();

      // [PRINT] All Predict Scores Of User
      console.log('All Predict Scores Of User: ', product_suggested_ids);
      // -------------END PRINTING----------------

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
      throw error;
    }
  }

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

  contentBasedFiltering = async (req: JWTRequest) => {
    try {
      const { product_id } = req.body;
      if (!product_id) {
        throw new HttpException("product_id not found", 404);
      }
      const product = await this.productModel.findByPk(product_id);
      if (!product) {
        throw new HttpException("Product not found", 404);
      }
      const contentBasedFiltering = new ContentBasedFiltering();
      const productVectors = await contentBasedFiltering.createVectorFromProduct();
      console.log({vector: productVectors[1].vector})
      const data = contentBasedFiltering.calculateSimilarity(productVectors);
      const similarityDocuments = contentBasedFiltering.getSimilarDocument(product.id, data);

      const promises = similarityDocuments.map(async (document: any) => {
        return await this.productModel.findByPk(document.id);
      })

      const products = await Promise.all(promises);

      return products;
    } catch (error) {
      throw error;
    }
  }

  getProduct = async (req: JWTRequest) => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new HttpException("product_id not found", 404);
      }
      const product = await this.productModel.findOne({
        where: {
          id
        }
      })
      if (!product) {
        throw new HttpException("Product not found", 404);
      }

      // Increase view by 1
      await product.update({ view: product.view + 1 });
      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  }

  getApriori = async (req: JWTRequest) => {
    try {
      const product_id = req.params.id;
      if (!product_id) {
        throw new HttpException("product_id not found", 404);
      }
      const product = await this.productModel.findOne({
        where: {
          id: product_id
        }
      })
      if (!product) {
        throw new HttpException("Product not found", 404);
      }

      const orders: any = await this.orderModel.findAll({
        include: [{ model: OrderItem, include: [{ model: Variant, include: [{ model: Product }] }] }]
      });



      // console.log(orders);

      const transactions: any = orders.map((order: any) => {
        const order_items_id = order.OrderItems.map((order_item: any) => {
          // console.log(order_item.Variant.Product)  
          return order_item.Variant.Product.id.toString()
        })
        return Array.from(new Set(order_items_id));
      })

      console.log({ transactions });
      let aprioriInstance = new Apriori.Algorithm(0.15, 0.6, true);

      console.log(aprioriInstance);
      // 0.1 là ngưỡng tối thiểu
      const result = aprioriInstance.analyze(transactions);
      console.log({ fis: result.frequentItemSets });
      // console.log({ asc: result.associationRules })
      const relatedProducts = result.associationRules
        .filter(rule => rule.lhs.includes(product_id.toString()) && rule.confidence > 0.5) // lọc ra những luật có độ tin cậy > 0.5
        .flatMap(rule => rule.rhs);
      // return relatedProducts;

      const product_ids = Array.from(new Set(relatedProducts.map(relatedProduct => parseInt(relatedProduct))));
      const products = await this.productModel.findAll({
        where: {
          id: product_ids
        }
      })
      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default ProductService;
