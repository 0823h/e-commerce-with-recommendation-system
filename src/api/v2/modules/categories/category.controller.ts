import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import CategoryService from './category.services';

class CategoryController {
  private categoryService: CategoryService;

  constructor(categoryServie: CategoryService) {
    this.categoryService = categoryServie;
  }

  getAllCategory = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getAllCategories(req);

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const page_count = categories.rows.length;
      const total_pages = Math.ceil(categories.count / limit);
      const total_count = categories.count;

      return res.status(200).json({
        message: 'success',
        data: {
          records: categories.rows,
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

  createCategory = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.createCategory(req);
      return res.status(200).json({
        message: 'success',
        data: category,
      });
    } catch (error) {
      return next(error);
    }
  };

  getCategoryProduct = async (req: JWTRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.categoryService.getCategoryProduct(req);
      return res.status(200).json({
        message: 'success',
        data: product,
      });
    } catch (err) {
      return next(err);
    }
  };
}

export default CategoryController;
