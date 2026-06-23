import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { ContentTypes, ResponseData, SendResponse } from "../utils";
interface AuthDTO {
	userEmail: string;
	userPassword: string;
};
export default class AuthController {
	static async register(req: Request, res: Response) {
    const data: ResponseData = {
			statusCode: 400,
			contentType: ContentTypes.Text,
			response: 'Missing Credentials'
		};

		try {
			const { userEmail, userPassword } = req.body as AuthDTO;

		  if (userEmail && userPassword) {
        const newData = await AuthService.register(userEmail, userPassword);
		  	Object.assign(data, newData);
		  }
		} catch (err) {
			console.error('Failed to register', err);
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = { message: 'Internal Server Error' };
		} finally { SendResponse(res, data); }
  }

	static async login(req: Request, res: Response) {
    const data: ResponseData = {
			statusCode: 400,
			contentType: ContentTypes.Text,
			response: 'Missing Credentials'
		};

		try {
			const { userEmail, userPassword } = req.body as AuthDTO;

			if (userEmail && userPassword) {
				const newData = await AuthService.login(userEmail, userPassword);
				Object.assign(data, newData);
			}
		} catch (err) {
			console.error('Login failed', err);
			data.statusCode = 500;
			data.contentType = ContentTypes.Json;
			data.response = { message: 'Internal Server Error' };
		} finally { SendResponse(res, data); }
  }
};