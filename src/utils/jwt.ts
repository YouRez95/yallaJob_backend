import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDocument } from "../models/session.model"
import { UserDocument } from "../models/user.model"
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";


export type AccessTokenPayload = {
  sessionId: SessionDocument['_id'],
  userId: UserDocument['_id'],
}

export type RefreshTokenPayload = {
  sessionId: SessionDocument['_id'],
}

type SignOptionAndSecret = SignOptions & {
  secret: string;
}

const defaults: SignOptions = {
  audience: ['user'],
}

const accessTokenOptions: SignOptionAndSecret = {
  secret: JWT_SECRET,
  expiresIn: "15m",
}

export const refreshTokenOptions: SignOptionAndSecret = {
  secret: JWT_REFRESH_SECRET,
  expiresIn: "30d",
}


export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionAndSecret
) => {
  const { secret, ...signOptions } = options || accessTokenOptions;
  return jwt.sign(payload, secret, {...defaults, ...signOptions });
}

export const verifyToken =<TPayload extends object = AccessTokenPayload>  (
  token: string,
  verifyOptions?: VerifyOptions & { secret: string }
) => {
  const {secret = JWT_SECRET, ...verifyOpt } = verifyOptions || {};
  
  try {
    const payload = jwt.verify(token, secret, {...defaults, ...verifyOpt}) as TPayload;
    return {
      payload,
    }
  } catch (error: any) {
    return {
      error: error.message as string,
    }    
  }
}