
import mongoose, { Schema, model, Document } from "mongoose";

export interface IChatModel extends Document {
  // _id?: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[]; 
  initiator: mongoose.Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
  is_blocked: boolean;
  is_accepted: 'pending' | 'accepted' | 'rejected';
  // lastMesssage: string;
}

const ChatSchema: Schema<IChatModel> = new Schema<IChatModel>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    initiator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    is_accepted: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    // lastMesssage:{
    //   type: String
    // }
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure that each pair of users is unique
ChatSchema.index({ users: 1, initiator: 1 }, { unique: true });

const ChatModel = mongoose.model<IChatModel>("ChatModel", ChatSchema);

export default ChatModel;
