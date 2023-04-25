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
      const products = await this.productService.getAllProducts(req);
      return res.status(200).json({
        message: 'success',
        data: products.rows,
      });
    } catch (error) {
      return next(error);
    }
  };

  getProductForUser = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.getProduct(req);
      return res.status(200).json({
        message: 'success',
        data: product,
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

  rateProduct = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const feedback = await this.productService.rateProduct(req);
      return res.status(200).json({
        status: 200,
        message: 'Success',
        data: feedback,
      });
    } catch (error) {
      return next(error);
    }
  };

  collaborativeFiltering = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.collaborativeFiltering(req);
      return res.status(200).json({
        status: 200,
        message: 'Success',
        data: products,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default ProductController;
