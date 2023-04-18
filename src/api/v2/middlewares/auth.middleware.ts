import { expressjwt } from 'express-jwt';
import { config } from 'dotenv';

config();

export const auth = expressjwt({
  secret: `${process.env.ACCESS_TOKEN_SECRET_KEY}`,
  algorithms: ['HS256'],
});
