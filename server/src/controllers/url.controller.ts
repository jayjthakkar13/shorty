import { Request, Response } from "express";

export default class UrlController {
	static async redirect(req: Request, res: Response) {}

	static async shorten(req: Request, res: Response) {}

	static async delete(req: Request, res: Response) {}

	static async getUrlList(req: Request, res: Response) {}
};