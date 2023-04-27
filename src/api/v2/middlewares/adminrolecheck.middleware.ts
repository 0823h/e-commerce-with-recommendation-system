import { Response, NextFunction } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { JwtPayload } from 'jsonwebtoken';

export const adminRoleCheck = (roles: string[]) => (req: JWTRequest, res: Response, next: NextFunction) => {
  const { admin_role } = (<JwtPayload>req.auth).data;
  if (!admin_role || !roles.includes(admin_role.toLowerCase())) {
    return res.status(401).json({ status: 401, error: 'No Permission' });
  }
  return next();
};
