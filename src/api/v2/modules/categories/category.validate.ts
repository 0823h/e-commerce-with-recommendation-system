import { Joi } from 'express-validation';

export const categoryCreateBody = {
  body: Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().optional(),
  }),
};
