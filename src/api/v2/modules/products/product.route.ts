import { Router } from 'express';
import { schema, validate } from 'express-validation';
import ProductController from './product.controller';
import ProductService from './product.services';
import { productCreateBody, productRateBody, variantCreateBody } from './product.validate';
import { auth } from '../../middlewares/auth.middleware';
import { adminRoleCheck } from '../../middlewares/adminrolecheck.middleware';

const productService = new ProductService();
const productController = new ProductController(productService);

const ProductRoute = Router();

ProductRoute.get('/cf', auth, productController.collaborativeFiltering);
// ProductRoute.get('/reindex', auth, productController.reindexProduct);
// ProductRoute.get('/reindex_feedback', productController.reindexFeedback);
ProductRoute.get('/:id', productController.getVariantsOfProduct);
ProductRoute.post('/:id', validate(variantCreateBody as schema), productController.createVariant);
ProductRoute.post('/:id/rate', auth, validate(productRateBody as schema), productController.rateProduct);
ProductRoute.get('/', productController.getAllProducts);
ProductRoute.post(
  '/',
  auth,
  adminRoleCheck(['superadmin', 'staff']),
  validate(productCreateBody as schema),
  productController.createProduct
);


export default ProductRoute;
