const express = require("express");
const router = express.Router();
const register = require("../controller/register");
const login = require("../controller/login");
const admin = require("../controller/admin");
const checkUser = require("../controller/checkUser");
const authenticate = require("../middleware/authenticate");
const userProfile = require("../controller/userProfile");

router.post("/sign", register);

router.post("/login", login);

router.post("/admin", admin);

router.get("/check", authenticate, checkUser);

router.post("/profile", userProfile);


module.exports = router;