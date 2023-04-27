import { Router } from 'express';
import { schema, validate } from 'express-validation';
import AdminController from './admin.controller';
import AdminService from './admin.services';
import { createAdminBody } from './admin.validate';

const adminService = new AdminService();
const adminController = new AdminController(adminService);

const AdminRoute = Router();

AdminRoute.post('/', validate(createAdminBody as schema), adminController.createAdmin);

export default AdminRoute;
