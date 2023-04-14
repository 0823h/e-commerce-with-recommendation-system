import { NextFunction, Request, Response } from 'express';
import ProductService from './product.services';

class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = this.productService.getAllProducts();
      res.status(200).json({
        message: 'success',
        products,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductController;
