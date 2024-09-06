import assert from "node:assert"
import { HttpStatusCode } from "../constants/http"
import AppErrorCode from "../constants/appErrorCode";
import AppError from './AppError';


type AppAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition

const appAssert: AppAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode))

export default appAssert;