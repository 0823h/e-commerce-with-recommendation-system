import { CustomSuccess } from '@src/api/v2/middlewares';

declare global {
  namespace Express {
    export interface Response {
      onSuccess: (data: any, custom?: CustomSuccess) => any;
    }
    export interface Request {
      rawBody?: string;
    }
  }
}

export {};
