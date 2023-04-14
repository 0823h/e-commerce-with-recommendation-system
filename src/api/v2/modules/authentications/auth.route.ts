import { Router } from 'express';
import { schema, validate } from 'express-validation';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import { authRegisterBody } from './auth.validate';

const authService = new AuthService();
const authController = new AuthController(authService);

const AuthRoute = Router();

AuthRoute.post('/register', validate(authRegisterBody as schema), authController.register);

export default AuthRoute;
