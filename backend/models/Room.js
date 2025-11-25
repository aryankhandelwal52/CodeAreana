import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
  participants: [{ userId: String, username: String, score: { type: Number, default: 0 } }],
  isStarted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
