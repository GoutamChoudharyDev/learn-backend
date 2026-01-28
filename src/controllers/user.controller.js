import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// register/ signUp controller
const registerUser = asyncHandler(async (req, res) => {
    // get user details form frontend
    // validation - not empty
    // check if user already exists
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh tokenn field from response
    // check for user creation
    // return res

    // step 1 : get data from frontend through req.body
    const { fullname, username, email, password } = req.body;

    // step 2 : validation
    if (
        !fullname?.trim() ||
        !username?.trim() ||
        !email?.trim() ||
        !password?.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "fill all the fileds"
        })
    }

    // step 3 : check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        return res.status(409).json({
            success: false,
            message: "User already exist"
        })
    }

    // step 4 : check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        res.status(400).json({
            success: false,
            message: "Avatar is required"
        })
    }

    // step 5 : upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        res.status(400).json({
            success: false,
            message: "Avatar is required"
        })
    }

    // step 6 : create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // step 7 : check user is created or not and also remove password and refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // step 8 : check for user creation
    if (!createdUser) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while registring a user"
        })
    }

    // step 9 : return the response
    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: createdUser
    })
});

export default registerUser;