import { Router } from 'express';
import ProductRoute from './products/product.route';
import AuthRoute from './authentications/auth.route';
import CategoryRoute from './categories/category.route';
import CartRoute from './carts/cart.route';
import AdminRoute from './admins/admin.route';
import OrderRoute from './orders/order.route';
import userRoute from './users/user.route';
import webhookRoute from './webhooks/webhooks.route';
import PaymentMethodRoute from './payment_methods/payment_method.route';

const router = Router();

router.use('/auth', AuthRoute);
router.use('/products', ProductRoute);
router.use('/categories', CategoryRoute);
router.use('/carts', CartRoute);
router.use('/admins', AdminRoute);
router.use('/orders', OrderRoute);
router.use('/users', userRoute);
router.use('/webhook', webhookRoute);
router.use('/payment_method', PaymentMethodRoute);

export default router;
