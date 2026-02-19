import Message from "../models/Message";
import mongoose from "mongoose";

export async function saveMessage(
  senderId: string,
  receiverId: string,
  text: string,
) {
  const msg = new Message({
    senderId: new mongoose.Types.ObjectId(senderId),
    receiverId: new mongoose.Types.ObjectId(receiverId),
    text,
  });
  await msg.save();
  return msg.toObject();
}

export async function getMessagesBetween(
  userA: string,
  userB: string,
  page = 1,
  limit = 50,
) {
  const skip = (Math.max(1, page) - 1) * limit;

  const messages = await Message.find({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Message.countDocuments({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  });

  return { messages, page, limit, total };
}
