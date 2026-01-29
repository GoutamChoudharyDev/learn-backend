import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// create schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        unique: true,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

// Pre-save middleware: runs before saving user document
// userSchema.pre("save", async function (next) {
//     // If password is NOT modified, skip hashing
//     if (!this.isModified("password")) return next();

//     // Hash the password
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

userSchema.pre("save", async function () {
    // 'this' refers to the document
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});


// custom method to check password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// Custom method to generate JWT access token
// Access token is short-lived and used for authenticating API requests
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        // Payload: data you want to store inside the token
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },

        // Secret key used to sign the access token
        process.env.ACCESS_TOKEN_SECRET,

        // Token expiry time
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

// Custom method to generate JWT refresh token
// Refresh token is long-lived and used to generate new access tokens
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        // Payload: minimal data for security
        {
            _id: this._id,
        },

        // Secret key used to sign the refresh token
        process.env.REFRESH_TOKEN_SECRET,

        // Token expiry time
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

// Create and export User model
export const User = mongoose.model("User", userSchema);