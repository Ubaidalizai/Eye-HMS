const User = require('../models/userModel');
const asyncHandler = require('../middlewares/asyncHandler.js');
const validMongoDBId = require('../utils/validateMongoDBId.js');
const generateToken = require('../utils/generateToken.js');
const validateMongoDBId = require('../utils/validateMongoDBId.js');
const Email = require('../utils/email.js');
const getAll = require('./handleFactory.js');

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/appError.js');

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
      throw new AppError('Failed to create image directory', 500);
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
    throw new AppError('Error processing image', 500);
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
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    percentage,
  } = req.body;
  console.log(req.body);
  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    throw new AppError('Please fill all the inputs.', 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists', 409);
  }

  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    percentage,
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
      percentage: newUser.percentage,
      image: newUser.image,
    });
  } catch (error) {
    throw new AppError('Error saving user', 400);
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  // 1) Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password!', 400);
  }

  const existingUser = await User.findOne({ email });

  // 2) Check if user exists and password is correct
  if (existingUser && (await existingUser.isPasswordValid(password))) {
    // 3) If everything is okay, send token to client
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
    throw new AppError('Email or password is incorrect!', 401);
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

const getAllUsers = getAll(User);

// Find User By Id (only admin can)
const findUserByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const user = await User.findById({ _id: id });

  if (user) {
    res.status(200).json(user);
  } else {
    throw new AppError('User not found!', 404);
  }
});

// Update User By Id (only admin can)
const updateUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);
  const { firstName, lastName, email, phoneNumber, role, percentage } =
    req.body;

  const user = await User.findById(id);

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.role = role || user.role;
    user.percentage = percentage || user.percentage;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      percentage: updatedUser.percentage,
    });
  } else {
    throw new AppError('User not found!', 404);
  }
});

// Delete User By Id (only admin can)
const deleteUserByID = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const user = await User.findById({ _id: id });
  if (user) {
    if (user.isAdmin) {
      throw new AppError('Cannot delete user as admin!', 400);
    }

    await User.deleteOne({ _id: user._id });
    res.status(204).json({ message: 'User removed successfully' });
  } else {
    throw new AppError('User not found!', 404);
  }
});

const getCurrentUserProfile = asyncHandler(async (req, res, next) => {
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
        role: user.role,
        percentage: user.percentage,
      },
    });
  } else {
    throw new AppError('User not found.', 404);
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res, next) => {
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
    throw new AppError('User not found', 404);
  }
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user || user.role !== 'admin') {
    throw new AppError(
      'There is no user with email address or not as admin.',
      404
    );
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
    console.log(err);
    throw new AppError(
      'There was an error sending the email. Try again later!',
      500
    );
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

  // 2) If the token has not expired and then is the user, set the new password
  if (!user) {
    throw new AppError('Token is invalid or has expired!', 400);
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update passwordChangedAt property for the user
  // 4) Log the user in, send JWT
  generateToken(res, user._id);
  res.status(200).json({
    status: 'success',
    message: 'Your password was reset successfully',
  });
});

const updatePassword = asyncHandler(async (req, res, next) => {
  const { _id } = req.user; // User's ID from authentication middleware
  validateMongoDBId(_id);

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new password are required', 400);
  }

  // 1) Get user from the database
  const user = await User.findById(_id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // 2) Validate current password
  const isMatch = await user.isPasswordValid(currentPassword); // Compare with hashed password
  if (!isMatch) {
    throw new AppError('Your current password is incorrect', 401);
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
