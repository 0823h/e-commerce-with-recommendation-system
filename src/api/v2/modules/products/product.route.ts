import { Router } from 'express';
import { schema, validate } from 'express-validation';
import ProductController from './product.controller';
import ProductService from './product.services';
import { productCreateBody, productRateBody } from './product.validate';
import { auth } from '../../middlewares/auth.middleware';

const productService = new ProductService();
const productController = new ProductController(productService);

const ProductRoute = Router();

ProductRoute.get('/cf', auth, productController.collaborativeFiltering);
ProductRoute.post('/:id/rate', auth, validate(productRateBody as schema), productController.rateProduct);
ProductRoute.get('/', productController.getAllProducts);
ProductRoute.post('/', validate(productCreateBody as schema), productController.createProduct);

export default ProductRoute;
