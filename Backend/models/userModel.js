<<<<<<< HEAD
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
=======
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
>>>>>>> origin/master

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
<<<<<<< HEAD
      required: [true, 'Pleas provide your first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Pleas provide your last name'],
    },
    email: {
      type: String,
      required: [true, 'Pleas provide your email address'],
=======
      required: [true, "Pleas provide your first name"],
    },
    lastName: {
      type: String,
      required: [true, "Pleas provide your last name"],
    },
    email: {
      type: String,
      required: [true, "Pleas provide your email address"],
>>>>>>> origin/master
      unique: true,
    },
    password: {
      type: String,
<<<<<<< HEAD
      required: [true, 'Pleas provide your password'],
    },
    phoneNumber: {
      type: Number,
      required: [true, 'Pleas provide your phone number'],
    },
    role: {
      type: String,
      enum: ['pharmacist', 'doctor', 'admin', 'sunglassesSeller'],
      default: 'sunglassesSeller',
=======
      required: [true, "Pleas provide your password"],
    },
    phoneNumber: {
      type: Number,
      required: [true, "Pleas provide your phone number"],
    },
    role: {
      type: String,
      enum: ["pharmacist", "doctor", "admin", "user"],
      default: "user",
>>>>>>> origin/master
    },
    imageUrl: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

<<<<<<< HEAD
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
=======
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
>>>>>>> origin/master
  // Hash the password with salt of 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-save middleware
<<<<<<< HEAD
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
=======
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
>>>>>>> origin/master

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.isPasswordValid = async function (userPassword) {
<<<<<<< HEAD
  console.log(userPassword);
=======
>>>>>>> origin/master
  return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    return JWTTimestamp < this.passwordChangedAt.getTime() / 1000;
  }

  return false;
};
userSchema.methods.createPasswordResetToken = function () {
<<<<<<< HEAD
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
=======
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
>>>>>>> origin/master

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
<<<<<<< HEAD
  const User = mongoose.model('User', userSchema);
=======
  const User = mongoose.model("User", userSchema);
>>>>>>> origin/master

  return resetToken;
};

<<<<<<< HEAD
const User = mongoose.model('User', userSchema);
=======
const User = mongoose.model("User", userSchema);
>>>>>>> origin/master
module.exports = User;
