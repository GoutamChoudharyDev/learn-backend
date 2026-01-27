import { Router } from "express";
import registerUser from "../controllers/user.controller.js";

// Create a new Express router instance
const router = Router();

router.route("/register").post(registerUser)


export default router;