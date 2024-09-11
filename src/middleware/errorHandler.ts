import { ErrorRequestHandler } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import AppError from "../utils/AppError";
import { Response } from "express";
import { z } from "zod";
import multer from "multer";



const handleAppError = (res: Response, err: AppError) => {
  return res.status(err.statusCode).json({
    message: err.message,
  })
}

const handleZodError = (res: Response, err: z.ZodError) => {
  const errors = err.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message
  }));

  return res.status(BAD_REQUEST).json({
    errors,
  })
}

const handleMulterError = (res: Response, err: multer.MulterError) => {
  return res.status(BAD_REQUEST).json({
    message: err.message
  })
}


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`PATH: ${req.path}`, err);

  if (err instanceof z.ZodError) {
    return handleZodError(res, err);
  }


  if (err instanceof AppError) {
    return handleAppError(res, err);
  }

  if (err instanceof multer.MulterError) {
    return handleMulterError(res, err)
  }

  return res.status(INTERNAL_SERVER_ERROR).send('Internal Server Error');
}

export default errorHandler;