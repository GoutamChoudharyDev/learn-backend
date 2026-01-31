import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new Express router instance
const router = Router();

// register route
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser,
)

// login route
router.post("/login", loginUser)

// secure routes
router.post("/logout", verifyJWT, logoutUser)

router.post("/refresh-token", refreshAccessToken)

export default router;