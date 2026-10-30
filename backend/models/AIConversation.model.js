import mongoose from "mongoose";

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "New conversation",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({
  user: 1,
  updatedAt: -1,
});

const AIConversation = mongoose.model(
  "AIConversation",
  aiConversationSchema
);

export default AIConversation;