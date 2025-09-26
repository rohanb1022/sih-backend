import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        sosId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SOS",
            required: true,
        },
        senderId: { type: String, required: true },
        message: { type: String, required: true },
        senderType: {
            type: String,
            enum: ["user", "admin"],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);