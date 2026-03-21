const mongoose = require("mongoose");
const crypto = require("crypto");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

GroupSchema.statics.generateToken = function () {
  return crypto.randomBytes(8).toString("hex");
};

module.exports = mongoose.model("Group", GroupSchema);
