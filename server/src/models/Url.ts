import { Schema, Types, model } from 'mongoose';

const urlSchema = new Schema({
	userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
	shortCode: {
    type: String,
    required: true
  },
	longUrl: {
    type: String,
    required: true
  },
	creationDate: {
    type: Date,
    default: Date.now
  }
});

urlSchema.index({ userId: 1, longUrl: 1, shortCode: 1 }, { unique: true });

export default model('Url', urlSchema);

export type UrlDocument = {
	userId: Types.ObjectId,
	shortCode: string,
	longUrl: string,
	creationDate: Date
};