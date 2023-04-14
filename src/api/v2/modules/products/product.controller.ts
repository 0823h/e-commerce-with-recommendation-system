import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import ProductService from './product.services';

class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  getAllProducts = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const products = this.productService.getAllProducts(req);
      return res.status(200).json({
        message: 'success',
        products,
      });
    } catch (error) {
      return next(error);
    }
  };

  createProduct = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.createProduct(req);
      return res.status(200).json({
        status: 200,
        message: 'Success',
        data: product,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default ProductController;