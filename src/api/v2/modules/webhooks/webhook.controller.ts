import { NextFunction, Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import crypto from 'crypto';


export const verifyWebhook = (req: JWTRequest, res: Response, next: NextFunction) => {
  let VERIFY_TOKEN = process.env.DIAGFLOW_VERIFY_TOKEN || 'pizza_chat_bot';

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};
