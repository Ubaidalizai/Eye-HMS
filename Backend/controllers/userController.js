const User = require('../models/userModel');
const asyncHandler = require('../middlewares/asyncHandler.js');
const validMongoDBId = require('../utils/validateMongoDBId.js');
const generateToken = require('../utils/generateToken.js');
const validateMongoDBId = require('../utils/validateMongoDBId.js');
const Email = require('../utils/email.js');

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configure Multer Storage in memory
const multerStorage = multer.memoryStorage();

// Filter to ensure only images are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Not an image! Please upload only images.', false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware to handle single image file upload with name 'image'
const uploadUserPhoto = upload.single('image');

// Resize and save the image using Sharp
const resizeUserPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  // Ensure directory exists
  const dir = path.join(__dirname, '../public/img/users');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
      throw new Error('Failed to create image directory');
    }
  }

  // Create a filename with user ID and timestamp, falling back if needed
  req.file.filename = `user-${Date.now()}.jpeg`;

  try {
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(path.join(dir, req.file.filename));
  } catch (error) {
    throw new Error('Error processing image');
  }

  next();
});

const updateUserPhoto = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      image: req.file.filename,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, role } = req.body;

  if (!firstName || !lastName || !email || !password || !phoneNumber || !role) {
    throw new Error('Please fill all the inputs.');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('User already exists');
  }

  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    image: req.file ? req.file.filename : null,
  });

  try {
    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
      image: newUser.image,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  // 1) Check if email and password is exist!
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password!');
  }
  const existingUser = await User.findOne({ email });

  // 2) Check if user exists and password is correct
  if (existingUser && (await existingUser.isPasswordValid(password))) {
    // 3) If every thing ok, send token to client
    const token = generateToken(res, existingUser._id);
    res.status(200).json({
      _id: existingUser._id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Email or password is incorrect!');
  }
});

// Logout current user
const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  res.status(200).json({
    users,
  });
});

// Find User By Id (only admin can)
const findUserByID = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const user = await User.findById({ _id: id });

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('USer not found!');
  }
});

// Update User By Id (only admin can)
const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  const { firstName, lastName, email, phoneNumber, role } = req.body;
  console.log(req.body);
  const user = await User.findById(id);

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.role = role || user.role;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found!');
  }
});

// Delete User By Id (only admin can)
const deleteUserByID = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const user = await User.findById({ _id: id });
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Can not delete user as admin!');
    }

    await User.deleteOne({ _id: user._id });
    res.status(204).json({ message: 'User removed successfully' });
  } else {
    res.status(404).json({ message: 'User not found!' });
  }
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id);

  const user = await User.findById({ _id });
  if (user) {
    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        image: user.image,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found.');
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validMongoDBId(_id);
  const { firstName, lastName, email, phoneNumber } = req.body;

  const user = await User.findById(_id);

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: updatedUser.email,
      phoneNumber: user.phoneNumber,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error('There is no user with email address.');
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/user/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    console.log(err);
    throw new Error('There was an error sending the email. Try again later!');
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if the token has not expired and then is the user, set the new password
  if (!user) {
    res.status(400);
    throw new Error('Token is invalid or has expired!');
  }
  user.password = req.body.password;
  // user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) update passwordChangedAt property for the user
  // 4) Log the user in, send JWT
  generateToken(res, user._id);
  res.status(200).json({
    status: 'success',
    message: 'Your password reseed successfully',
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user; // User's ID from authentication middleware
  validateMongoDBId(_id);

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current and new password are required');
  }

  // 1) Get user from the database
  const user = await User.findById(_id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2) Validate current password
  const isMatch = await user.isPasswordValid(currentPassword); // Compare with hashed password
  if (!isMatch) {
    res.status(401);
    throw new Error('Your current password is incorrect');
  }

  // 3) Update to new password
  user.password = newPassword; // This should trigger hashing in Mongoose middleware
  await user.save();

  // 4) Respond with success message
  res.status(200).json({
    status: 'success',
    message: 'Your password was updated successfully',
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutCurrentUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAllUsers,
  findUserByID,
  updateUserById,
  deleteUserByID,
  getCurrentUserProfile,
  uploadUserPhoto,
  resizeUserPhoto,
  updateUserPhoto,
  updatePassword,
  forgotPassword,
  resetPassword,
};
