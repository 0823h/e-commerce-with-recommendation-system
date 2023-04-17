import { Router } from 'express';
import CategoryService from './category.services';
import CategoryController from './category.controller';

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

const CategoryRoute = Router();

CategoryRoute.get('/', categoryController.getAllCategory);

export default CategoryRoute;
