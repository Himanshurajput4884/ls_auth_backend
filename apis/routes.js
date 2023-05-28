const express = require("express");
const router = express.Router();
const register = require("../controller/register");
const login = require("../controller/login");
const admin = require("../controller/admin");


router.post("/sign", register);

router.post("/login", login);

router.post("/admin", admin);


module.exports = router;