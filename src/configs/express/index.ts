import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import routes from '@src/api/v2/modules';

import { config } from 'dotenv';
import cors from 'cors';
import ResponseHelper from '@src/api/v2/middlewares/response.middleware';
import { ValidationError } from 'express-validation';
import { errorHandler } from '@src/api/v2/middlewares/error.middleware';

config();

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Cors
app.use(cors(corsOptions));

// app.use(ResponseHelper.getDefaultResponseHandler);

// Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parser
app.use(
  express.json({
    verify: (req: Request, res: Response, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v2', routes);

app.use('*', (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({ status: '404', message: 'Not Found' });
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    const error = err.name;
    let { message } = err;

    if (err.details.body) {
      message = err.details.body[0].message;
    }

    return res.status(400).json({ status: '400', error, message });
  }

  return next(err);
});
app.use(errorHandler);

export default app;
