import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        isSuperAdmin: boolean;
      };
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies['auth_token'];
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    req.userId = (decoded as JwtPayload).userId;
    req.user = {
      isSuperAdmin: (decoded as JwtPayload).isSuperAdmin,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const verifySuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: No user provided' });
  }

  if (req.user.isSuperAdmin === false) {
    return res
      .status(403)
      .json({ message: 'Forbidden: Access denied, only Admin allowed!' });
  }
  next();
};
