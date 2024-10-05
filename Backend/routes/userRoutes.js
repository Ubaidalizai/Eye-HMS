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
  userController.updateUserPhoto
);

router
  .route("/profile")
  .get(authenticate, userController.getCurrentUserProfile)
  .patch(authenticate, userController.updateCurrentUserProfile); // Updated to handle PATCH requests

// Admin routes
router.use(authenticate);
router
  .route("/:id")
  .get(userController.findUserByID)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserByID);

module.exports = router;
