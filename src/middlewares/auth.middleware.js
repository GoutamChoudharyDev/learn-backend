import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export const verifyJWT = asyncHandler(async (req, res, next) => {

    // Get token either from cookies or from Authorization header (Bearer token)
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    // If token is not found, user is unauthorized
    if (!token) {
        return res.status(404).json({
            success: false,
            message: "Unauthorized request"
        })
    }

    // Verify token using secret key and decode payload
    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    )

    // Find user in DB using decoded token's user ID
    // Exclude password and refreshToken for security
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    // If user does not exist, token is invalid
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid Access Token"
        })
    }

    // Attach user object to request for next middleware/controller
    req.user = user;

    // Move to next middleware or controller
    next();
})