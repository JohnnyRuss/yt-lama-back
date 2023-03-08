const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  googleAuth,
} = require("../controllers/authenticationController");

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").post(logout);

router.route("/refresh").post(refresh);

router.route("/google-auth").post(googleAuth);

module.exports = router;
