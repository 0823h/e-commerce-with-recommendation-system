import { Router } from 'express';
import PaymentMethodService from './payment_method.services';
import PaymentMethodController from './payment_method.controller';

const paymentMethodService = new PaymentMethodService();
const paymentMethodController = new PaymentMethodController(paymentMethodService);

const PaymentMethodRoute = Router();

export default PaymentMethodRoute;
