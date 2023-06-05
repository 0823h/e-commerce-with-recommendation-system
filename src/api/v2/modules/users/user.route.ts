import { Router } from 'express';
import { schema, validate } from 'express-validation';
import { auth } from '../../middlewares/auth.middleware';
import { adminRoleCheck } from '../../middlewares/adminrolecheck.middleware';
import UserService from './user.services';
import UserController from './user.controller';
import { userCreateBody, userUpdateBody } from './user.validate';

const userService = new UserService();
const userController = new UserController(userService);

const userRoute = Router();

userRoute.get('/', auth, adminRoleCheck(['superadmin']), userController.getUsers);
userRoute.post(
  '/',
  auth,
  adminRoleCheck(['superadmin']),
  validate(userCreateBody as schema),
  userController.createUser
);
userRoute.get('/:id', auth, adminRoleCheck(['superadmin']), userController.getUser);
userRoute.put(
  '/:id',
  auth,
  adminRoleCheck(['superadmin']),
  validate(userUpdateBody as schema),
  userController.updateUser
);
userRoute.delete('/:id', auth, adminRoleCheck(['superadmin']), userController.deleteUser);

export default userRoute;
