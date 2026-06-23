import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export default async function authenticate (req: Request, res: Response, next: NextFunction) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			res.status(401).json({ message: 'Unauthorized: Missing bearer token' });
			return;
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as { id: string };
		const user = await User.findById(decoded.id).select('-passwordHash');

		if (!user) {
			res.status(401).json({ message: 'Unauthorized: Invalid token' });
			return;
		}

		req.user = user;
		next();
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			res.status(401).json({ message: 'Unauthorized: Invalid token' });
			return;
		}
		res.status(500).json({ message: 'Internal Server Error' });
	}
}