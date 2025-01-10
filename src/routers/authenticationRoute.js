const router = require("express").Router();
const passport = require("passport");
const authValidation = require("../validations/authValidation");
const authController = require("../controllers/authController");
// const rateLimitMiddleware=require ("../middleware/limitMiddleware/rateLimitMiddleware")
// const rateLimitByEmailMiddleware =require("../middleware/limitMiddleware/rateLimitByEmailMiddleware ")
router.post("/register", authValidation.register, authController.register);
router.post("/confirmOtp",authValidation.confirmOtp,authController.confirmOtp);
router.post("/login", authValidation.login, authController.login);
router.put("/refreshToken", authController.refreshToken);
router.post("/forgotPassword",authValidation.forgotPassword,authController.forgotPassword);
router.post("/resetPassword",authValidation.resetPassword,authController.resetPassword);
router.get("/account", authController.account);
router.put("/logout", authController.logout);
router.get("/auth/google",passport.authenticate("google", { scope: ["profile", "email"] }));
// Route callback sau khi Google xác thực
router.get("/auth/google/callback",passport.authenticate("google", { session: false }),authController.loginGoogle);
module.exports = router;
