import { Router } from 'express';
import { schema, validate } from 'express-validation';
import CategoryService from './category.services';
import CategoryController from './category.controller';
import { categoryCreateBody } from './category.validate';

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

const CategoryRoute = Router();

CategoryRoute.get('/', categoryController.getAllCategory);
CategoryRoute.get('/:category_id', categoryController.getCategoryProduct);
CategoryRoute.post('/', validate(categoryCreateBody as schema), categoryController.createCategory);

export default CategoryRoute;
