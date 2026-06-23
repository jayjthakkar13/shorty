import { Types } from "mongoose";
import User from "../models/User";
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import jwt, { SignOptions } from 'jsonwebtoken';
import { ContentTypes, GetResponseData, ResponseData } from "../utils";

enum AuthTypes {
	Register,
	Login
};

type ValidationResult = {
	isValid: boolean;
	errors: string[];
};

const scrypt = promisify(crypto.scrypt);

export default class AuthService {
	private static readonly Validations = {
		EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		PASSWORD_MIN_LENGTH: 8,
		PASSWORD_MAX_LENGTH: 32,
		REQUIRE_LOWERCASE: /[a-z]/,
		REQUIRE_UPPERCASE: /[A-Z]/,
		REQUIRE_DIGIT: /\d/,
		REQUIRE_SYMBOL: /[!@#$%^&*(),.?":{}|<>]/
	};

	private static validateCredentials(email: string, password: string, authType: AuthTypes): ValidationResult {
		const errors: string[] = [];
	
		if (!this.Validations.EMAIL_REGEX.test(email)) errors.push('Invalid email format.');
	
		if (password.length < this.Validations.PASSWORD_MIN_LENGTH) errors.push(`Password must be at least ${this.Validations.PASSWORD_MIN_LENGTH} characters long.`);
	
		if (password.length > this.Validations.PASSWORD_MAX_LENGTH) errors.push(`Password must not exceed ${this.Validations.PASSWORD_MAX_LENGTH} characters.`);
	
		if (authType === AuthTypes.Register) {
			if (!this.Validations.REQUIRE_LOWERCASE.test(password)) errors.push('Password must include at least one lowercase letter.');
	
			if (!this.Validations.REQUIRE_UPPERCASE.test(password)) errors.push('Password must include at least one uppercase letter.');
	
			if (!this.Validations.REQUIRE_DIGIT.test(password)) errors.push('Password must include at least one number.');
	
			if (!this.Validations.REQUIRE_SYMBOL.test(password)) errors.push('Password must include at least one symbol.');
		}
	
		return {
			isValid: errors.length === 0,
			errors
		} as ValidationResult;
	}

	private static async generatePasswordHash(password: string): Promise<string> {
		const salt = crypto.randomBytes(16).toString('base64url');
		const key = (await scrypt(password, salt, 32) as Buffer).toString('base64url');
		return `${salt}:${key}`;
	}

	private static async verifyPassword(password: string, hash: string): Promise<boolean> {
		const [ salt, key ] = hash.split(':');
		const derivedKey = (await scrypt(password, salt!, 32)) as Buffer;
		return crypto.timingSafeEqual(
			Buffer.from(key!, 'base64url'),
			derivedKey
		);
	}

	private static issueTokens(userId: Types.ObjectId): string {
		const accessExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as NonNullable<SignOptions['expiresIn']>;
		const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: accessExpiresIn });
		return token;
	}

	public static async register(email: string, password: string): Promise<ResponseData> {
		const { isValid, errors } = this.validateCredentials(email, password, AuthTypes.Register);
		if (!isValid) return GetResponseData(400, ContentTypes.Json, {
			message: 'Invalid Credentials', errors
		});

    const existingUser = await User.findOne({ email });
    if (existingUser) return GetResponseData(400, ContentTypes.Text, 'User already exists');

    const passwordHash = await this.generatePasswordHash(password);
    const user = await User.create({ email, passwordHash });

		try {
			const token = this.issueTokens(user._id);
			return GetResponseData(201, ContentTypes.Json, {
				token,
				user: { email: user.email }
			});
		} catch (err) {
      await User.deleteOne({ _id: user._id });
			throw err;
		}
	}

	public static async login(email: string, password: string): Promise<ResponseData> {
		const InvalidCredentialsResponse: ResponseData = GetResponseData(401, ContentTypes.Text, 'Incorrect Credentials');

		const { isValid, errors } = this.validateCredentials(email, password, AuthTypes.Login);

		if (!isValid) {
			return GetResponseData(400, ContentTypes.Json, {
				message: 'Invalid email or password format',
				errors
			});
		}

		const user = await User.findOne({ email });
		if (!user) return InvalidCredentialsResponse;

		const validPassword = await this.verifyPassword(password, user.passwordHash);
		if (!validPassword) return InvalidCredentialsResponse;

		const token = this.issueTokens(user._id);

		return GetResponseData(200, ContentTypes.Json, {
			token,
			user: { email: user.email }
		});
	}
}