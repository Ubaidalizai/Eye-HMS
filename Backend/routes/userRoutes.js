const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

router
  .route('/register')
  .post(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.registerUser
  );
router.route('/login').post(userController.loginUser);

router.use(authenticate);

router.route('/').get(authorizeAdmin, userController.getAllUsers);
router.route('/logout').post(userController.logoutCurrentUser);
router
  .route('/updatePassword')
  .patch(authorizeAdmin, userController.updatePassword);
router.patch(
  '/updateMe',
  userController.resizeUserPhoto,
  userController.updateUserPhoto
);

router
  .route('/profile')
  .get(userController.getCurrentUserProfile)
  .patch(userController.updateCurrentUserProfile);

router
  .route('/doctorsHave-percentage')
  .get(userController.getAllDoctorsWithPercentage);

// Admin routes
router.use(authorizeAdmin);
router
  .route('/doctorsHave-percentage')
  .get(userController.getAllDoctorsWithPercentage);

router
  .route('/:id')
  .get(userController.findUserByID)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserByID);

module.exports = router;
