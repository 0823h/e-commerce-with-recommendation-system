import { DataTypes, Model, ModelStatic } from 'sequelize';
import db from '@database';
import User from './user.model';
import Address from './address.model';

export interface IPaymentMethod extends Model {
    id: number;
    name: string;
    pre_paid: boolean;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentMethod = db.sequelize?.define<IPaymentMethod>(
    'PaymentMethod',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        pre_paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        paranoid: true,
    }
) as ModelStatic<IPaymentMethod>;

export default PaymentMethod;



