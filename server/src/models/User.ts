import { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
	email: {
    type: String,
    required: true
  },
	passwordHash: {
    type: String,
    required: true
  }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

export default model('User', userSchema);

export type UserDocument = {
	_id: Types.ObjectId,
	email: string,
	passwordHash?: string
};