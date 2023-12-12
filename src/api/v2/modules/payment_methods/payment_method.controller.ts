import { NextFunction, Request, Response } from 'express';
import PaymentMethodService from './payment_method.services';

class PaymentMethodController {
    private readonly paymentMethodService: PaymentMethodService;

    constructor(paymentMethodService: PaymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

}

export default PaymentMethodController;