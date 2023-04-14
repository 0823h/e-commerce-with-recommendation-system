import { Router } from 'express';
import { schema, validate } from 'express-validation';
import ProductController from './product.controller';
import ProductService from './product.services';
import { productCreateBody } from './product.validate';

const productService = new ProductService();
const productController = new ProductController(productService);

const ProductRoute = Router();

ProductRoute.get('/', productController.getAllProducts);
ProductRoute.post('/', validate(productCreateBody as schema), productController.createProduct);

export default ProductRoute;
