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
      return res.status(200).json({
        message: 'success',
        data: categories.rows,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default CategoryController;
