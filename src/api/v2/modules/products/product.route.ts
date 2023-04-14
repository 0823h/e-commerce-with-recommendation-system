import { Router } from 'express';
import ProductController from './product.controller';
import ProductService from './product.services';

const productService = new ProductService();
const productController = new ProductController(productService);

const ProductRoute = Router();

ProductRoute.get('/', productController.getAllProducts);
ProductRoute.post('/', productController.createProduct);

export default ProductRoute;
