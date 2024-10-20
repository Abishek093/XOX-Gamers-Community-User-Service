import mongoose, { Schema, Document, Types } from "mongoose";

interface IOtp extends Document {
  otp: number;
  userId: Types.ObjectId; 
  createdAt: Date; 
}

const OtpSchema: Schema = new Schema({
  otp: { type: Number, required: true },
  userId: { type: Types.ObjectId, required: true, ref: 'User' }, 
  createdAt: { type: Date, default: Date.now, expires: 120 } 
});

const OtpModel = mongoose.model<IOtp>('Otp', OtpSchema);
export default OtpModel;
