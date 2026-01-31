import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// create method to generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // find user in database using userId
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found while generating tokens");
        }

        // generate access token using user model method
        const accessToken = await user.generateAccessToken();

        // generate refresh token using user model method
        const refreshToken = await user.generateRefreshToken();

        // store refresh token in database for future validation
        user.refreshToken = refreshToken;

        // save user without running validations again
        await user.save({ validateBeforeSave: false })

        // return both tokens
        return { accessToken, refreshToken }

    } catch (error) {
        throw new Error(
            error.message || "Token generation failed"
        )
    }
}

// register/signUp controller
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if (!fullname?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({
            success: false,
            message: "fill all the fields"
        })
    }

    const existedUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existedUser) {
        return res.status(409).json({
            success: false,
            message: "User already exist"
        })
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        return res.status(400).json({
            success: false,
            message: "Avatar is required"
        })
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar || !avatar.url) {
        return res.status(400).json({
            success: false,
            message: "Avatar upload failed"
        });
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email: email.toLowerCase().trim(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while registring a user"
        })
    }

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: createdUser
    });
});

// login controller
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        return res.status(400).json({
            success: false,
            message: "username or email is required!"
        })
    }

    const user = await User.findOne({ $or: [{ email }, { username }] })
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "user not found register first!"
        })
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials!"
        })
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            message: "Login successfully !",
            user: loggedInUser
        })
});

// logout controller
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            success: true,
            message: "User logged Out successfully!"
        })
})

// refreshAccessToken controller
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized request!" });
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired refresh token!" });
    }

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        return res
            .status(401)
            .json({
                message: "Invalid refresh token"
            })
    }

    if (incomingRefreshToken !== user.refreshToken) {
        return res
            .status(401)
            .json({
                success: false, message: "Refresh token is expired or already used!"
            });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            accessToken,
            refreshToken
        });
})

// controller to change password
const changePassword = asyncHandler(async (req, res) => {
    // get old and new password from frontend
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // validation
    if (!oldPassword || !newPassword || !confirmPassword) {
        return res
            .status(400)
            .json({
                success: false,
                message: "All fields are required"
            })
    }

    // check confirm password and new password correct
    if (newPassword !== oldPassword) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Confirm password does not match"
            })
    }

    // find user
    const user = await User.findById(req.user?._id);

    if (!user) {
        return res
            .status(404)
            .json({
                success: false,
                message: "User not found"
            })
    }

    // check password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Old password is incorrect"
        })
    }

    // change password
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    // if password change successfully 
    return res
        .status(200)
        .json({
            success: true,
            message: "Password change successfully"
        })

})

// get current user controller
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Current user fetched successfully",
        user: req.user
    })
})

// update account controller
const updateAccountController = asyncHandler(async (req, res) => {
    // get details
    const { fullname, email, username } = req.body;

    if (!fullname || !email || !username) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    // find user and update details
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
                username: username,
            }
        },
        { new: true }
    ).select("-password")

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "user not found during update details"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Account details updated successfully",
        user
    })
})

// update user avatar controller
const updateUserAvatar = asyncHandler(async (req, res) => {
    // get image from req.file
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        return res.status(400).json({
            success: false,
            message: "Avatar file is missing"
        })
    }

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        return res.status(404).json({
            success: false,
            message: "Error while uploading avatar on cloudinary while updating"
        })
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found during update avatar"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Avatar update successfully",
        user
    })
})

// update user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    // get cover image
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        return res.status(400).json({
            success: false,
            message: "CoverImage file is missing"
        })
    }

    // upload on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        return res.status(404).json({
            success: false,
            message: "Error while uploading coverImage on cloudinary while updating"
        })
    }

    // find user and update coverImage
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found during update cover image"
        })
    }

    return res.status(200).json({
        success: true,
        message: "CoverImage update successfully"
    })

})

// exports...
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountController,
    updateUserAvatar,
    updateUserCoverImage
}
