import AppErrorCode from "../constants/appErrorCode";
import { UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { verifyToken } from "../utils/jwt";



export const authenticate = catchErrors(async (req, res, next) => {
  // Get the access token
  const authorizationHeader = req.headers['authorization'];
  appAssert(authorizationHeader && authorizationHeader.startsWith('Bearer '), UNAUTHORIZED, "Authorization header is missing or invalid");
  const accessToken = authorizationHeader.split(" ")[1];

  // Verify token
  const { error, payload } = verifyToken(accessToken);
  appAssert(payload, UNAUTHORIZED, error === 'jwt expired' ? 'Token expired' : 'Invalid Token', AppErrorCode.InvalidAccessToken);

  // Store the user on the request
  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  next();
})