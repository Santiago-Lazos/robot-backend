import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ["admin", "operator"], default: "operator" },
//   tenantId: mongoose.Schema.Types.ObjectId,
});

export default mongoose.model("User", userSchema);
