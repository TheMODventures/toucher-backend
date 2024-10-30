import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces';
import { HttpException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

export const hashPassword = (password: string): string => bcrypt.hashSync(password, 10);

export const comparePassword = (password: string, hash: string): boolean => bcrypt.compareSync(password, hash);

export const generateFilename = (req: Request, file: any, cb: any) => {
  cb(null, uuidv4() + '.' + file.originalname.split('.').pop());
};

export const filterImage = (req: Request, file: any, cb: any) => {
  if (!file.mimetype.match(/image\/(jpg|JPG|webp|jpeg|JPEG|png|PNG|gif|GIF|jfif|JFIF|svg|SVG)/)) {
    req['fileValidationError'] = 'Only image files are allowed!';
    return cb(null, false);
  }
  cb(null, true);
};

export const generateResponse = <T>(data: T, message: string, res: Response, statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    data,
    message,
    statusCode,
  };

  res.status(statusCode).json(response);
};

export const throwException = (message: string, statusCode: number) => {
  throw new HttpException({
    statusCode,
    message: message?.replace(/\"/g, ''),
  }, statusCode);
};

export const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);  // 6-digit OTP
}

export const multerStorage = {
  storage: diskStorage({ destination: './uploads/', filename: generateFilename }),
  fileFilter: filterImage,
}