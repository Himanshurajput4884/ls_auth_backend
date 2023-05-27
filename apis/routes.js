const express = require("express");
const router = express.Router();
const register = require("../controller/register");
const login = require("../controller/login");
const authenticate = require("../middleware/authenticate");

router.post("/sign", register);


router.get("/login", authenticate, login);




module.exports = router;