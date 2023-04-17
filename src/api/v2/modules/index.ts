import { Router } from 'express';
import ProductRoute from './products/product.route';
import AuthRoute from './authentications/auth.route';
import CategoryRoute from './categories/category.route';

const router = Router();

router.use('/auth', AuthRoute);
router.use('/products', ProductRoute);
router.use('/categories', CategoryRoute);

export default router;
