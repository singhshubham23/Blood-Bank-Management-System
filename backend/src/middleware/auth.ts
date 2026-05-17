import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const ensureAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Not authorized to access this route" });
  }
};

export const ensureRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "User role not authorized" });
    }
    next();
  };
};
