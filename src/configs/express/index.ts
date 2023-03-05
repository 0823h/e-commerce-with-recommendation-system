import express from 'express';
import morgan from 'morgan';
import routes from '@src/api/v2/modules';
import cors from 'cors';
import { config } from 'dotenv';

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
console.log('abc');
export default app;
function cors(corsOptions: { origin: string; methods: string; credentials: boolean }): any {
  throw new Error('Function not implemented.');
}
