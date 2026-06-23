import { Response } from 'express';

export enum ContentTypes {
	Json = 'application/json',
	Text = 'text/plain'
};

export interface ResponseData {
	statusCode: number;
	contentType: ContentTypes;
	response: any;
};

export const GetResponseData = (code: number, type: ContentTypes, data: any): ResponseData => ({
	statusCode: code,
	contentType: type,
	response: data
});

export const SendResponse = (res: Response, data: ResponseData) => {
	res.writeHead(data.statusCode, { 'content-type': data.contentType });
	res.end(
		data.contentType === ContentTypes.Json
		? JSON.stringify(data.response)
		: data.response
	);
};