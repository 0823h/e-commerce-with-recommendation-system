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

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = products.rows.length;
      const total_pages = Math.ceil(products.count / limit);
      const total_count = products.count;

      return res.status(200).json({
        status: 200,
        message: 'success',
        data: {
          records: products.rows,
          metadata: {
            page,
            limit,
            page_count,
            total_pages,
            total_count,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  };

  getVariantsOfProduct = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const variants = await this.productService.getVariantOfProduct(req);

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = variants.rows.length;
      const total_pages = Math.ceil(variants.count / limit);
      const total_count = variants.count;

      return res.status(200).json({
        message: 'success',
        data: {
          records: variants.rows,
          metadata: {
            page,
            limit,
            page_count,
            total_pages,
            total_count,
          },
        },
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

  createVariant = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const variant = await this.productService.createVariant(req);
      return res.status(200).json({
        status: 200,
        message: 'Success',
        data: variant,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default ProductController;
