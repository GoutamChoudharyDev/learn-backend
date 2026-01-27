import { asyncHandler } from "../utils/asyncHandler.js";

// register/ signUp controller
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ajay ok",
    })
});

export default registerUser;