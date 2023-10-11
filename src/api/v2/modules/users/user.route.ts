import { Router } from 'express';
import { schema, validate } from 'express-validation';
import { auth } from '../../middlewares/auth.middleware';
import { adminRoleCheck } from '../../middlewares/adminrolecheck.middleware';
import UserService from './user.services';
import UserController from './user.controller';
import { createAddress, updateAddress, userCreateBody, userUpdateBody } from './user.validate';

const userService = new UserService();
const userController = new UserController(userService);

const userRoute = Router();

// Address API
// CRUD
userRoute.post('/address', auth, validate(createAddress as schema), userController.createAddress);
userRoute.get('/addresses', auth, userController.retrieveAddresses);
userRoute.get('/address/:address_id', auth, userController.retrieveAddress);
userRoute.put('/address/:address_id', auth, validate(updateAddress as schema), userController.updateAddress);
userRoute.delete('/address/:address_id', auth, userController.deleteAddress);

// Get Self Info
userRoute.get('/self', auth, userController.retrieveSelfUser);
userRoute.put('/self', auth, userController.updateUser);

userRoute.post('/guests', userController.createGuest);

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
  userController.updateUserForAdmin
);
userRoute.delete('/:id', auth, adminRoleCheck(['superadmin']), userController.deleteUser);


export default userRoute;
