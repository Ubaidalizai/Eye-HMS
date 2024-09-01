const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    phone: {
      type: Number,
      required: [true, 'Pleas provide your phone number'],
    },
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

userSchema.methods.isPasswordValid = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
