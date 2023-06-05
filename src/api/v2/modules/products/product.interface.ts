/* eslint-disable @typescript-eslint/no-explicit-any */
import { IProduct } from '@src/configs/database/models/product.model';
import { Optional, OrderItem } from 'sequelize';

export interface IQuery {
  subQuery?: boolean;
  where?: any;
  attributes?: any;
  group?: any;
  raw?: any;
  order?: OrderItem[];
  include?: any;
  offset?: number;
  limit?: number;
  sort?: string;
  distinct?: boolean;
}

// export interface IProductCreate extends Optional<IProduct, 'name' | 'description' | 'images' | 'quantity'> {}
