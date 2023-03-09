import mongoose from "mongoose";

export default mongoose.model(
  "user",
  new mongoose.Schema({
    id: { type: String },
    love_you: { type: Boolean, default: false },
    morning: { type: Boolean, default: false },
    night: { type: Boolean, default: false },
    pet_name: { type: String, default: null },
  })
);
