import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import os from 'os';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as math from 'mathjs';
import { HttpException } from './http-exception';

export const objectId = () => {
  const secondInHex = Math.floor(new Date().valueOf() / 1000).toString(16);
  const machineId = crypto.createHash('md5').update(os.hostname()).digest('hex').slice(0, 6);
  const processId = process.pid.toString(16).slice(0, 4).padStart(4, '0');
  const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0');

  return secondInHex + machineId + processId + counter;
};

export const generateToken = (secretKey: string, data: object, time: string): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        data,
      },
      secretKey,
      { expiresIn: time },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        return resolve(token);
      }
    );
  });
};

export const verifyToken = (
  token: string,
  secretKey: string,
  ignoreExpiration = false
): Promise<string | jwt.JwtPayload | undefined> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secretKey,
      {
        ignoreExpiration,
      },
      (error, decoded) => {
        if (error) {
          return reject(new HttpException('Unauthorized', 401));
        }
        return resolve(decoded);
      }
    );
  });
};
export const bcryptHashPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 12, (error, data) => {
      if (error) {
        return reject(error);
      }
      return resolve(data);
    });
  });
};

export const bcryptComparePassword = (rawPassword: string, hashedPassword: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(rawPassword, hashedPassword, (error, data) => {
      if (error) {
        return reject(error);
      }
      return resolve(data);
    });
  });
};

export const checkZeroArray = (array: number[]): boolean => {
  let flag = true;
  array.forEach((element) => {
    if (element !== 0) {
      flag = false;
    }
  });

  return flag;
};

export const cosine_similarity = (a: number[], b: number[]): number => {
  if (checkZeroArray(a) === true || checkZeroArray(b) === true) {
    console.log('zero!!');
    return math.dot(a, b) / (Number(math.norm(a)) * Number(math.norm(b)) + 1e-10);
  }
  return math.dot(a, b) / (Number(math.norm(a)) * Number(math.norm(b)));
};
