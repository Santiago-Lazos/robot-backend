import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, unique: true },   // viene de user.sub
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, enum: ["admin", "operator"], default: "operator" },
  tenantId: mongoose.Schema.Types.ObjectId,  
}, { timestamps: true });                     

export default mongoose.model("User", userSchema);
