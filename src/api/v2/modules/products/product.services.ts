import Product, { IProduct } from '@models/product.model';
import { ModelStatic } from 'sequelize';
import { HttpException } from '../../utils/http-exception';

class ProductService {
  private readonly productModel: ModelStatic<IProduct>;
  constructor() {
    this.productModel = Product;
  }

  getAllProducts = async (): Promise<{ rows: IProduct[]; count: number }> => {
    try {
      const products = await this.productModel.findAndCountAll();

      if (!products) {
        throw new HttpException('Product not found', 404);
      }

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export default ProductService;
