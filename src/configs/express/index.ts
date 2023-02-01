import express from 'express';
import morgan from 'morgan';
import routes from '@src/api/v2/modules';

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v2', routes);
console.log('abc');
export default app;
