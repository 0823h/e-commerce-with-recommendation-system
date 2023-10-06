import { Router } from 'express';
import { verifyWebhook } from './webhook.controller';

const webhookRoute = Router();

webhookRoute.get('/', verifyWebhook);

export default webhookRoute;