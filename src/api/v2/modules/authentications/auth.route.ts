import { Router } from 'express';
import { schema, validate } from 'express-validation';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import { authLoginBody, authRegisterBody } from './auth.validate';

const authService = new AuthService();
const authController = new AuthController(authService);

const AuthRoute = Router();

AuthRoute.post('/register', validate(authRegisterBody as schema), authController.register);
AuthRoute.post('/login', validate(authLoginBody as schema), authController.login);

export default AuthRoute;
