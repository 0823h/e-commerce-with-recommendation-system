import PaymentMethod, { IPaymentMethod } from "@src/configs/database/models/payment_method.model";
import { ModelStatic } from "sequelize";

class PaymentMethodService {
    private readonly paymentMethodModel: ModelStatic<IPaymentMethod>;

    constructor() {
        this.paymentMethodModel = PaymentMethod;
    }
}

export default PaymentMethodService;