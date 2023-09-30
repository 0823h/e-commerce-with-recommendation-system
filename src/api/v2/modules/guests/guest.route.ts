import { Router } from 'express';
import { schema, validate } from 'express-validation';
import GuestService from './guest.service';
import GuestController from './guest.controller';
const guestService = new GuestService();
const guestController = new GuestController(guestService);
const guestRoute = Router();
guestRoute.post("/products/:id/rate", guestController.rateProduct);
export default guestRoute;


