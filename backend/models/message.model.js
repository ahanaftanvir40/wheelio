import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  vehicleId: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  username: {
    type:String
  },
  message: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Message = mongoose.model('Message', MessageSchema);


