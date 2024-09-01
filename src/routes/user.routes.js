import { Router } from "express";
import { registerUser,loginUser,userProfile,logOut,contact } from "../controller/userController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secure endpoint

router.route("/userprofile").get(verifyJWT,userProfile)
router.route("/logout").post(verifyJWT,logOut)
router.route("/contact").post(verifyJWT,contact)


export default router
