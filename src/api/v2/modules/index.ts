import { Router } from 'express';
import ProductRoute from './products/product.route';

const router = Router();

router.use('/products', ProductRoute);

export default router;
