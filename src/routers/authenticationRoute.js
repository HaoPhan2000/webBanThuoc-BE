const router = require("express").Router();
const authValidation=require("../validations/authValidation")
const authController=require("../controllers/authController")
const rateLimitMiddleware=require ("../middleware/limitMiddleware/rateLimitMiddleware")
const rateLimitByEmailMiddleware =require("../middleware/limitMiddleware/rateLimitByEmailMiddleware ")
router.post("/register",authValidation.register, authController.register);
router.post("/confirmOtp",authValidation.confirmOtp, authController.confirmOtp);
router.post("/login",authValidation.login, authController.login);
// router.put("/refreshToken", Controller.refreshToken);
// router.post("/forgotPassword", Controller.forgotPassword);
// router.post("/resetPassword", Controller.resetPassword);
// router.put("/logout", Controller.logout);

module.exports= router
