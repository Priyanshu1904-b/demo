const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const locationSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    address: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user"
    },
    verified: { type: Boolean, default: false },
    location: locationSchema,
    otpHash: String,
    otpExpiresAt: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const user = this.toObject();
  delete user.password;
  delete user.otpHash;
  delete user.otpExpiresAt;
  return user;
};

module.exports = mongoose.model("User", userSchema);
