import { asyncHandler } from "../utils/asyncHandler.js";

// register/ signUp controller
const registerUser = asyncHandler(async (req, res) => {
    // get user details form frontend
    // validation - not empty
    // check if user already exists
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh tokenn field from response
    // return res
});

export default registerUser;