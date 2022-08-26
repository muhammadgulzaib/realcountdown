const express = require("express");
const router = express.Router();
const forgotPasswordController = require("./../controllers/forgotPasswordController");

router.get("/", forgotPasswordController.sendMail);

module.exports = router;
