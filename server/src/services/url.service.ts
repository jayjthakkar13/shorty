import { Types } from "mongoose";
import Url, { UrlDocument } from "../models/Url";
import User from "../models/User";
import crypto from "node:crypto";
import { ContentTypes, GetResponseData, ResponseData } from "../utils";

export default class UrlService {
	private static generateShortCode (userId: string, longUrl: string, attempt: number = 0) {
		const seed = attempt === 0
			? `uid:${userId}|url:${longUrl}`
			: `uid:${userId}|url:${longUrl}|n:${attempt}`;
		return crypto
			.createHash('sha256')
			.update(seed)
			.digest('base64url')
			.slice(0, 8);
	}

	private static async fetchUserUrls(userId: Types.ObjectId) {
		const entries = await Url.find({ userId }).sort({ creationDate: -1 });
		return entries.map((entry: UrlDocument) => ({
			shortUrl: `${process.env.BASE_URL}/${entry.shortCode}`,
			longUrl: entry.longUrl,
			creationDate: entry.creationDate
		}));
	}

	public static async redirect(shortCode: string): Promise<string | undefined> {
		if (!shortCode) return undefined;

		const entry = await Url.findOne({ shortCode });
		return entry?.longUrl;
	}

	public static async shorten(userId: Types.ObjectId, longUrl: string): Promise<ResponseData> {
		const existing = await Url.findOne({ userId, longUrl });
		if (existing) return GetResponseData(302, ContentTypes.Json, await this.fetchUserUrls(userId));

		const MAX_ATTEMPTS = 10;
		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const shortCode = this.generateShortCode(userId.toString(), longUrl, attempt);
			try {
				await Url.create({ userId, longUrl, shortCode });
				return GetResponseData(201, ContentTypes.Json, await this.fetchUserUrls(userId));
			} catch (err: any) {
				if (err?.code !== 11000) throw err;
				if (err?.keyPattern?.shortCode) continue;
				const raced = await Url.findOne({ userId, longUrl });
				if (raced) return GetResponseData(302, ContentTypes.Json, await this.fetchUserUrls(userId));
				throw err;
			}
		}

		return GetResponseData(500, ContentTypes.Text, 'Failed to allocate a unique short code');
	}

	public static async delete(userId: Types.ObjectId, longUrl: string): Promise<ResponseData> {
		const queryFilters = { userId, longUrl };

		const result = await Url.deleteOne(queryFilters);
		if (result.deletedCount === 0) return GetResponseData(400, ContentTypes.Text, 'Invalid long url found');

		return GetResponseData(200, ContentTypes.Json, await this.fetchUserUrls(userId));
	}

	public static async getUrlList(userId: Types.ObjectId): Promise<ResponseData> {
		const existingUser = await User.findById(userId);
		if(!existingUser) return GetResponseData(400, ContentTypes.Text, 'Invalid User Id');

		return GetResponseData(200, ContentTypes.Json, await this.fetchUserUrls(userId));
	}
}