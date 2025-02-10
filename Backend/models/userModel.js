const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Pleas provide your first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Pleas provide your last name'],
    },
    email: {
      type: String,
      required: [true, 'Pleas provide your email address'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Pleas provide your password'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Pleas provide your phone number'],
    },
    role: {
      type: String,
      enum: ['pharmacist', 'admin', 'receptionist', 'doctor'],
      default: 'doctor',
    },
    image: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with salt of 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-save middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.isPasswordValid = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    return JWTTimestamp < this.passwordChangedAt.getTime() / 1000;
  }

  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
  const User = mongoose.model('User', userSchema);

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
