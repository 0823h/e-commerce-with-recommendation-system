import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../utils/http-exception';

export const errorHandler = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
  let status = err.statusCode || 500;

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ status: 401, error: 'Unauthorized', message: err.message });
  }

  if (err?.name === 'ValidationError') {
    status = 400;
  }

  return res.status(status).json({ status, error: err.message });
};
