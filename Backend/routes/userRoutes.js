const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

router.route('/').get(userController.getAllUsers);
router
  .route('/register')
  .post(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.registerUser
  );
router.route('/login').post(userController.loginUser);
router.route('/logout').post(userController.logoutCurrentUser);
router
  .route('/updatePassword')
  .patch(authenticate, userController.updatePassword);
router.patch(
  '/updateMe',
  authenticate,
  userController.resizeUserPhoto,
  authenticate,
  userController.updateUserPhoto
);

router
  .route('/profile')
  .get(authenticate, userController.getCurrentUserProfile)
  .patch(authenticate, userController.updateCurrentUserProfile);

// Admin routes
router.use(authenticate);
router
  .route('/:id')
  .get(userController.findUserByID)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserByID);

module.exports = router;
