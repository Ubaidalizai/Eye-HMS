const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Pleas provide your first name"],
    },
    lastName: {
      type: String,
      required: [true, "Pleas provide your last name"],
    },
    email: {
      type: String,
      required: [true, "Pleas provide your email address"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Pleas provide your password"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "Pleas provide your phone number"],
    },
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.isPasswordValid = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < this.passwordChangedAt.getTime() / 1000;
  }

  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
