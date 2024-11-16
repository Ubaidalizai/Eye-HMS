const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

router
  .route('/register')
  .post(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.registerUser
  );
router.route('/login').post(userController.loginUser);

router.use(authenticate);

router.route('/').get(userController.getAllUsers);
router.route('/logout').post(userController.logoutCurrentUser);
router.route('/updatePassword').patch(userController.updatePassword);
router.patch(
  '/updateMe',
  userController.resizeUserPhoto,
  userController.updateUserPhoto
);

router
  .route('/profile')
  .get(userController.getCurrentUserProfile)
  .patch(userController.updateCurrentUserProfile);

// Admin routes

router
  .route('/:id')
  .get(userController.findUserByID)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserByID);

module.exports = router;
