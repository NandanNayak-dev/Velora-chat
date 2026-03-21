const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  isAdmin: { type: Boolean, default: false },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
});

UserSchema.plugin(passportLocalMongoose, {
  usernameLowerCase: true,
  usernameQueryFields: ["email"],
}); // adds username, hash, salt

module.exports = mongoose.model("User", UserSchema);
