const express = require("express");

const authController = require("./auth.controller");

const router = express.Router();

/* Register route */
router.post("/register", authController.register);

module.exports = router;