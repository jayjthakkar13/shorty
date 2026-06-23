import { Request, Response } from "express";
import UrlService from "../services/url.service";
import { ContentTypes, ResponseData, SendResponse } from "../utils";

export default class UrlController {
	static async redirect(req: Request<{ shortCode: string }>, res: Response) {
    const data: ResponseData = {
			statusCode: 404,
			contentType: ContentTypes.Text,
			response: 'URL not found'
		};
		try {
			const longUrl = await UrlService.redirect(req.params.shortCode ?? '');
			if (longUrl) {
				res.redirect(longUrl);
				return;
			}
		} catch (err) {
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = {
				message: 'Internal Server Error',
				error: err
			};
		} finally { if (!res.headersSent) SendResponse(res, data); }
  }

	static async shorten(req: Request, res: Response) {
    const data: ResponseData = {
			statusCode: 400,
			contentType: ContentTypes.Json,
			response: {
				error: "userId and url are required"
			}
		};

		try {
			const { url } = req.body;
			const userId = req.user._id;
	
			if (userId && url) {
				const newData = await UrlService.shorten(userId, url);
				Object.assign(data, newData);
			}
		} catch (err) {
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = {
				message: 'Internal Server Error',
				error: err
			};
		} finally { SendResponse(res, data); }
  }

	static async delete(req: Request, res: Response) {
    const data: ResponseData = {
			statusCode: 400,
			contentType: ContentTypes.Json,
			response: {
				error: "userId and url are required"
			}
		};

		try {
			const longUrl = req.longUrl;
			const userId = req.user._id;

			if (userId && longUrl) {
				const newData = await UrlService.delete(userId, longUrl);
				Object.assign(data, newData);
			}
		} catch (err) {
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = {
				message: 'Internal Server Error',
				error: err
			};
		} finally { SendResponse(res, data); }
  }

	static async getUrlList(req: Request, res: Response) {
    const data: ResponseData = {
			statusCode: 400,
			contentType: ContentTypes.Json,
			response: {
				error: "userId is required"
			}
		};

		try {
			const userId = req.user._id;

			if (userId) {
				const newData = await UrlService.getUrlList(userId);
				Object.assign(data, newData);
			}
		} catch (err) {
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = {
				message: 'Internal Server Error',
				error: err
			};
		} finally { SendResponse(res, data); }
  }
};