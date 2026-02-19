import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Indexes to support queries that fetch messages between two users and paginate by createdAt
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, senderId: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
