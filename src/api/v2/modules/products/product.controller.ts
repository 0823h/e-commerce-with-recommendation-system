import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import ProductService from './product.services';
import { error } from 'console';

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
      const data = await this.productService.getVariantOfProduct(req);
      console.log(data);

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = data.rows.length;
      const total_pages = Math.ceil(data.count / limit);
      const total_count = data.count;

      return res.status(200).json({
        message: 'success',
        data: {
          records: {
            product: data.product,
            variants: data.rows,
          },
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

  // reindexProduct = async (req: JWTRequest, res: Response, next: NextFunction) => {
  //   try {
  //     const result = await this.productService.reindexProducts(req);
  //     return res.status(200).json(
  //       {
  //         status: 200,
  //         message: 'Success',
  //         data: result
  //       }
  //     )
  //   } catch (error) {
  //     return next(error);
  //   }
  // }

  // reindexFeedback = async (req: JWTRequest, res: Response, next: NextFunction) => {
  //   try {
  //     const result = await this.productService.reindexFeedbacks(req);
  //     return res.status(200).json(
  //       {
  //         status: 200,
  //         message: 'Success',
  //         data: result
  //       }
  //     )
  //   } catch (error) {
  //     return next(error);
  //   }
  // }

  contentBasedFiltering = async(req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const cbf_data = await this.productService.contentBasedFiltering(req);
      return res.status(200).json({
        status: 200,
        message: 'success',
        data: cbf_data
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ProductController;
