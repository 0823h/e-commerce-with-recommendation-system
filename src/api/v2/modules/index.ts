import { Router } from 'express';
import ProductRoute from './products/product.route';
import AuthRoute from './authentications/auth.route';

const router = Router();

router.use('/auth', AuthRoute);
router.use('/products', ProductRoute);

export default router;
