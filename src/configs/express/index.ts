import express from 'express';
import morgan from 'morgan';
import routes from '@src/api/v2/modules';

import { config } from 'dotenv';
import cors from 'cors';

config();

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Cors
app.use(cors(corsOptions));

// Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v2', routes);
export default app;
