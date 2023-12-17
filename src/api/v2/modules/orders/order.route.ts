import { Router } from 'express';
import { schema, validate } from 'express-validation';
import OrderService from './order.services';
import OrderController from './order.controller';
import { adminCreateOrderBody, userCreateOrderBody, assignToShipper, changeOrderStatus } from './order.validate';
import { auth } from '../../middlewares/auth.middleware';
import { adminRoleCheck } from '../../middlewares/adminrolecheck.middleware';

const orderService = new OrderService();
const orderController = new OrderController(orderService);

const OrderRoute = Router();

OrderRoute.get('/', auth, adminRoleCheck(['superadmin', 'staff']), orderController.getOrders);
OrderRoute.post('/admin', validate(adminCreateOrderBody as schema), orderController.adminCreateOrder);
OrderRoute.post('/user', auth, validate(userCreateOrderBody as schema), orderController.userCreateOrder);
OrderRoute.post('/vnpay', auth, orderController.vnpay);
OrderRoute.get('/train', orderController.trainModel);
OrderRoute.get('/get-statistics', orderController.getStatistics);
OrderRoute.get('/get-unique-id', orderController.getUniqueId);
OrderRoute.get('/:id/products-name', orderController.getOrderProducts);
OrderRoute.put('/:id/assign-shipper', auth, adminRoleCheck(['superadmin', 'staff']), validate(assignToShipper as schema), orderController.assignToShipper);
OrderRoute.put('/:id/change-status', auth, adminRoleCheck(['superadmin', 'staff', 'shipper']), validate(changeOrderStatus as schema), orderController.changeOrderStatus);

export default OrderRoute;
