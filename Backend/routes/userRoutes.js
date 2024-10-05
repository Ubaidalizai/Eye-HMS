<<<<<<< HEAD
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

router.route('/').get(userController.getAllUsers);
router.route('/register').post(userController.registerUser);
router.route('/login').post(userController.loginUser);
router.route('/logout').post(userController.logoutCurrentUser);
router
  .route('/updatePassword')
  .patch(authenticate, userController.updatePassword);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  authenticate,
  userController.resizeUserPhoto,
  authenticate,
=======
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");

router.route("/").get(userController.getAllUsers);
router.route("/register").post(userController.registerUser);
router.route("/login").post(userController.loginUser);
router.route("/logout").post(userController.logoutCurrentUser);
router.patch("/updatePassword", authenticate, userController.updatePassword);
router.patch(
  "/updateCurrentUserProfile",
  authenticate,
  userController.updateCurrentUserProfile
);

router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  authenticate,
  userController.resizeUserPhoto,
>>>>>>> origin/master
  userController.updateUserPhoto
);

router
<<<<<<< HEAD
  .route('/profile')
  .get(authenticate, userController.getCurrentUserProfile)
  .patch(authenticate, userController.updateCurrentUserProfile);
=======
  .route("/profile")
  .get(authenticate, userController.getCurrentUserProfile)
  .patch(authenticate, userController.updateCurrentUserProfile); // Updated to handle PATCH requests
>>>>>>> origin/master

// Admin routes
router.use(authenticate);
router
<<<<<<< HEAD
  .route('/:id')
=======
  .route("/:id")
>>>>>>> origin/master
  .get(userController.findUserByID)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserByID);

module.exports = router;
