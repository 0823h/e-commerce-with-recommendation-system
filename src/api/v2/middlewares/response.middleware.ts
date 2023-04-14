import { Response, Request, NextFunction } from 'express';

export interface CustomSuccess {
  message?: any;
  code?: number;
}

export class ResponseHelper {
  static middlewareResponse(req: Request, res: Response, next: NextFunction) {
    res.onSuccess = ResponseHelper.getDefaultResponseHandler(res).onSuccess;
    return next();
  }

  static getDefaultResponseHandler(res: Response) {
    return {
      onSuccess(data: any, custom: CustomSuccess = {}) {
        const { message, code } = custom;
        const codeRest = code || 200;
        return res.status(codeRest).json({
          status: codeRest,
          message: message || 'Success',
          data,
        });
      },
    };
  }
}
export default ResponseHelper;
